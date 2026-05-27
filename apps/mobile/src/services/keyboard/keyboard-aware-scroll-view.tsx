import type { ReactNode } from "react";
import type { KeyboardAwareScrollViewProps } from "react-native-keyboard-controller";
import { KeyboardAwareScrollView as BaseKeyboardAwareScrollView } from "react-native-keyboard-controller";
import { withUniwind } from "uniwind";

export const KeyboardAwareScrollView = withUniwind(
  BaseKeyboardAwareScrollView,
) as ((
  props: KeyboardAwareScrollViewProps & {
    className?: string;
    contentContainerClassName?: string;
  },
) => ReactNode) &
  typeof BaseKeyboardAwareScrollView;
