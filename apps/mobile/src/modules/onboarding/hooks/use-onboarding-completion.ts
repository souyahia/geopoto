import { useMMKVBoolean } from "react-native-mmkv";

const ONBOARDING_COMPLETION_STORAGE_KEY = "onboarding-completion";

export function useOnboardingCompletion() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useMMKVBoolean(
    ONBOARDING_COMPLETION_STORAGE_KEY,
  );

  return {
    isOnboardingCompleted,
    setIsOnboardingCompleted,
  };
}
