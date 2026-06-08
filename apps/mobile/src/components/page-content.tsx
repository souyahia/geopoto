import { cn } from "heroui-native/utils";
import type { ComponentProps } from "react";
import { View, type ViewStyle } from "react-native";

export const PAGE_CONTENT_MAX_WIDTH = 560;

export const PAGE_CONTENT_STYLE = {
  maxWidth: PAGE_CONTENT_MAX_WIDTH,
} satisfies ViewStyle;

export const PAGE_MODAL_SURFACE_STYLE = {
  alignSelf: "center",
  maxWidth: PAGE_CONTENT_MAX_WIDTH,
  width: "100%",
} satisfies ViewStyle;

type PageContentProps = ComponentProps<typeof View>;

export function PageContent({ className, style, ...props }: PageContentProps) {
  return (
    <View
      className={cn("w-full self-center", className)}
      style={[PAGE_CONTENT_STYLE, style]}
      {...props}
    />
  );
}
