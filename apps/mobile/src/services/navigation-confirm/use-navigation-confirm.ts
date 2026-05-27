import { usePreventRemove } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useMemo, useRef } from "react";

import {
  type NavigationConfirmModalTexts,
  useNavigationConfirmStore,
} from "./navigation-confirm-store";

export interface UseNavigationConfirmParams extends NavigationConfirmModalTexts {
  isDisabled?: boolean;
}

export function useNavigationConfirm({
  cancelLabel,
  confirmLabel,
  description,
  isDisabled = false,
  title,
}: UseNavigationConfirmParams = {}) {
  const navigation = useNavigation();
  const showNavigationConfirmModal = useNavigationConfirmStore(
    (state) => state.showNavigationConfirmModal,
  );
  const isPromptVisibleRef = useRef(false);
  const modalTexts = useMemo(
    () => ({
      cancelLabel,
      confirmLabel,
      description,
      title,
    }),
    [cancelLabel, confirmLabel, description, title],
  );
  const shouldPreventRemove = !isDisabled;

  usePreventRemove(shouldPreventRemove, ({ data }) => {
    if (isPromptVisibleRef.current) {
      return;
    }

    isPromptVisibleRef.current = true;

    showNavigationConfirmModal({
      modalTexts,
      onCancel: () => {
        isPromptVisibleRef.current = false;
      },
      onConfirm: () => {
        isPromptVisibleRef.current = false;
        navigation.dispatch(data.action);
      },
    });
  });
}
