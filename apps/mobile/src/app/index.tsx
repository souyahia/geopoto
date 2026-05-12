import { Redirect } from "expo-router";

import { useOnboardingCompletion } from "@/modules/onboarding/hooks/use-onboarding-completion";

export default function HomeScreen() {
  const { isOnboardingCompleted } = useOnboardingCompletion();

  if (!isOnboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/home" />;
}
