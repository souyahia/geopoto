import type { LucideIcon, LucideProps } from "lucide-react-native";
import { useResolveClassNames } from "uniwind";

interface ThemedIconProps extends Omit<LucideProps, "color"> {
  icon: LucideIcon;
  color?: string;
}

export function ThemedIcon({
  icon: Icon,
  size = 24,
  strokeWidth = 2,
  color = "accent-foreground",
  ...props
}: ThemedIconProps) {
  const { accentColor } = useResolveClassNames(color);

  return (
    <Icon
      {...props}
      color={accentColor}
      size={size}
      strokeWidth={strokeWidth}
    />
  );
}
