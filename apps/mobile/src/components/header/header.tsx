import { cn } from "heroui-native/utils";
import { useCallback, useState } from "react";
import {
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { createSlots } from "@/utils/slots/create-slots";

import { HeaderProvider, useHeaderContext } from "./header.context";

function HeaderRoot({ className, children, style, ...props }: ViewProps) {
  const [centerHeight, setCenterHeight] = useState(0);

  const slots = createSlots(children, {
    left: HeaderLeft,
    center: HeaderCenter,
    right: HeaderRight,
  });

  const rootStyle = buildHeaderRootStyle({ centerHeight, style });

  return (
    <HeaderProvider onUpdateCenterHeight={setCenterHeight}>
      <View
        className={cn("relative flex-row items-center", className)}
        style={rootStyle}
        {...props}
      >
        {slots.left}
        <View
          pointerEvents="box-none"
          className="flex-1 items-center justify-center"
        >
          {slots.main}
        </View>
        {slots.right}
        {slots.center}
      </View>
    </HeaderProvider>
  );
}

function HeaderLeft({ className, children, ...props }: ViewProps) {
  return (
    <View className={cn("items-start justify-center", className)} {...props}>
      {children}
    </View>
  );
}
HeaderLeft.displayName = "Header.Left";

function HeaderCenter({ className, children, onLayout, ...props }: ViewProps) {
  const context = useHeaderContext();

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      context.onCenterLayout(event);
      onLayout?.(event);
    },
    [context, onLayout],
  );

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center"
    >
      <View
        pointerEvents="box-none"
        className={cn("items-center justify-center", className)}
        onLayout={handleLayout}
        {...props}
      >
        {children}
      </View>
    </View>
  );
}
HeaderCenter.displayName = "Header.Center";

function HeaderRight({ className, children, ...props }: ViewProps) {
  return (
    <View className={cn("items-end justify-center", className)} {...props}>
      {children}
    </View>
  );
}
HeaderRight.displayName = "Header.Right";

export const Header = Object.assign(HeaderRoot, {
  Left: HeaderLeft,
  Center: HeaderCenter,
  Right: HeaderRight,
});

interface BuildHeaderRootStyleParams {
  centerHeight: number;
  style: StyleProp<ViewStyle>;
}

function buildHeaderRootStyle({
  centerHeight,
  style,
}: BuildHeaderRootStyleParams): StyleProp<ViewStyle> {
  if (centerHeight === 0) {
    return style;
  }

  return [{ minHeight: centerHeight }, style];
}
