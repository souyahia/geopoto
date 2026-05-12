import { Redirect, Slot } from "expo-router";

import { useOnboardingCompletion } from "@/modules/onboarding/hooks/use-onboarding-completion";

export default function OnboardingLayout() {
  const { isOnboardingCompleted } = useOnboardingCompletion();

  if (isOnboardingCompleted) {
    return <Redirect href="/home" />;
  }

  return <Slot />;
}
