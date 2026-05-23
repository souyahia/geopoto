import { useRouter } from "expo-router";
import { type ButtonRootProps } from "heroui-native/button";
import { cn } from "heroui-native/utils";

import { FlagIcon } from "@/components/flag-icon";
import { HapticButton } from "@/components/haptic-button";
import { setLanguage } from "@/services/i18n/i18n";
import type { SupportedLocale } from "@/services/i18n/locale";
import { getLanguageCountryCode } from "@/utils/language/language-country-code";
import { getLanguageName } from "@/utils/language/language-name";

import { useOnboardingCompletion } from "../hooks/use-onboarding-completion";

interface LangButtonProps {
  locale: SupportedLocale;
  onPress?: () => void;
}

export function LangButton({
  locale,
  className,
  ...props
}: LangButtonProps & ButtonRootProps) {
  const router = useRouter();
  const { setIsOnboardingCompleted } = useOnboardingCompletion();

  const handlePress = () => {
    setLanguage(locale);
    setIsOnboardingCompleted(true);
    router.replace("/home");
  };

  return (
    <HapticButton
      size="sm"
      variant="tertiary"
      className={cn("justify-start", className)}
      onPress={handlePress}
      {...props}
    >
      <FlagIcon code={getLanguageCountryCode(locale)} width={24} />
      <HapticButton.Label>{getLanguageName(locale)}</HapticButton.Label>
    </HapticButton>
  );
}
