import { useCallback, useRef } from "react";
import type { GestureResponderEvent } from "react-native";

const PRESS_GUARD_COOLDOWN_MS = 500;

interface UsePressGuardParams {
  cooldownMs?: number;
  onPress?: ((event: GestureResponderEvent) => void) | null;
}

/**
 * Wraps a press handler so a single pressable cannot fire it more than once
 * within a short cooldown. This guards against double-taps registering twice
 * (for example pushing the same navigation route twice). The guard is scoped to
 * the component instance, so tapping two different pressables in quick
 * succession still triggers both handlers.
 */
export function usePressGuard({
  cooldownMs = PRESS_GUARD_COOLDOWN_MS,
  onPress,
}: UsePressGuardParams) {
  const lastPressTimeRef = useRef(0);

  return useCallback(
    (event: GestureResponderEvent) => {
      if (typeof onPress !== "function") {
        return;
      }

      const now = Date.now();
      if (now - lastPressTimeRef.current < cooldownMs) {
        return;
      }

      lastPressTimeRef.current = now;
      onPress(event);
    },
    [cooldownMs, onPress],
  );
}
