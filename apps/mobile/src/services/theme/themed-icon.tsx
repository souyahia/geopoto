import type { LucideIcon, LucideProps } from "lucide-react-native";
import { useResolveClassNames } from "uniwind";

interface ThemedIconProps extends Omit<LucideProps, "color"> {
  icon: LucideIcon;
  color?: LucideProps["color"];
  colorClassName?: string;
}

export function ThemedIcon({
  icon: Icon,
  size = 24,
  strokeWidth = 2,
  color,
  colorClassName = "text-foreground",
  ...props
}: ThemedIconProps) {
  const { color: resolvedColor } = useResolveClassNames(colorClassName);

  return (
    <Icon
      {...props}
      color={color ?? resolvedColor}
      size={size}
      strokeWidth={strokeWidth}
    />
  );
}
