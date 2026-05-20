import { type ReactNode } from "react";
import { Platform, ScrollView, View } from "react-native";

const IOS_NATIVE_BACK_GESTURE_SHIELD_EXTRA_WIDTH = 1;

interface NativeBackGestureShieldProps {
  children: ReactNode;
  contentWidth: number;
  isEnabled?: boolean;
}

export function NativeBackGestureShield({
  children,
  contentWidth,
  isEnabled = true,
}: NativeBackGestureShieldProps) {
  const shouldUseShield = Platform.OS === "ios" && isEnabled;

  if (!shouldUseShield) {
    return <>{children}</>;
  }

  // On iOS 26, react-native-screens gives horizontal UIScrollViews priority over the native full screen back gesture.
  // The extra point makes the wrapper count as horizontally scrollable without visible movement.
  return (
    <ScrollView
      alwaysBounceHorizontal={false}
      bounces={false}
      contentContainerClassName="h-full"
      contentContainerStyle={{
        width: contentWidth + IOS_NATIVE_BACK_GESTURE_SHIELD_EXTRA_WIDTH,
      }}
      directionalLockEnabled
      disableScrollViewPanResponder
      horizontal
      scrollEventThrottle={16}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      className="h-full w-full"
    >
      <View className="h-full w-full" style={{ width: contentWidth }}>
        {children}
      </View>
    </ScrollView>
  );
}
