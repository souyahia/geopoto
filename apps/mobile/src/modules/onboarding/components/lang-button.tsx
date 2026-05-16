import { useRouter } from "expo-router";
import type { ButtonRootProps } from "heroui-native/button";
import { Button } from "heroui-native/button";
import { cn } from "heroui-native/utils";

import { CountryFlag } from "@/components/country-flag";
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
    <Button
      size="sm"
      variant="tertiary"
      className={cn("justify-start", className)}
      onPress={handlePress}
      {...props}
    >
      <CountryFlag code={getLanguageCountryCode(locale)} width={24} />
      <Button.Label>{getLanguageName(locale)}</Button.Label>
    </Button>
  );
}
