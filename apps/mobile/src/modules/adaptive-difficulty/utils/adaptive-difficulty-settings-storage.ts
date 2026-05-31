import { createMMKV, useMMKVBoolean } from "react-native-mmkv";

const adaptiveDifficultySettingsStorage = createMMKV({
  id: "adaptive-difficulty-settings-storage",
});
const ADAPTIVE_DIFFICULTY_ENABLED_STORAGE_KEY = "adaptive-difficulty-enabled";

export function useAdaptiveDifficultySettings() {
  const [isAdaptiveDifficultyEnabled = true, setIsAdaptiveDifficultyEnabled] =
    useMMKVBoolean(
      ADAPTIVE_DIFFICULTY_ENABLED_STORAGE_KEY,
      adaptiveDifficultySettingsStorage,
    );

  return {
    isAdaptiveDifficultyEnabled,
    setIsAdaptiveDifficultyEnabled,
  };
}

export function isAdaptiveDifficultyEnabled(): boolean {
  return (
    adaptiveDifficultySettingsStorage.getBoolean(
      ADAPTIVE_DIFFICULTY_ENABLED_STORAGE_KEY,
    ) ?? true
  );
}
