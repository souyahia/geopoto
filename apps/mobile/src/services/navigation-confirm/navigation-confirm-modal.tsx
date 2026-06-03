import { Dialog } from "heroui-native/dialog";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { HapticButton } from "@/components/haptic-button";
import { PAGE_MODAL_SURFACE_STYLE } from "@/components/page-content";

import {
  type NavigationConfirmModalTexts,
  useNavigationConfirmStore,
} from "./navigation-confirm-store";

interface ResolvedNavigationConfirmModalTexts {
  cancelLabel: string;
  confirmLabel: string;
  description: string;
  title: string;
}

interface GetNavigationConfirmModalTextsParams {
  modalTexts: NavigationConfirmModalTexts;
  t: TFunction;
}

function getNavigationConfirmModalTexts({
  modalTexts,
  t,
}: GetNavigationConfirmModalTextsParams): ResolvedNavigationConfirmModalTexts {
  return {
    cancelLabel: modalTexts.cancelLabel ?? t("navigation-confirm.cancel-label"),
    confirmLabel:
      modalTexts.confirmLabel ?? t("navigation-confirm.confirm-label"),
    description: modalTexts.description ?? t("navigation-confirm.description"),
    title: modalTexts.title ?? t("navigation-confirm.title"),
  };
}

export function NavigationConfirmModal() {
  const { t } = useTranslation();
  const isModalVisible = useNavigationConfirmStore(
    (state) => state.isModalVisible,
  );
  const modalTexts = useNavigationConfirmStore((state) => state.modalTexts);
  const cancelNavigation = useNavigationConfirmStore(
    (state) => state.cancelNavigation,
  );
  const confirmNavigation = useNavigationConfirmStore(
    (state) => state.confirmNavigation,
  );
  const resolvedModalTexts = getNavigationConfirmModalTexts({ modalTexts, t });

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      return;
    }

    cancelNavigation();
  };

  return (
    <Dialog isOpen={isModalVisible} onOpenChange={handleOpenChange}>
      <Dialog.Portal unstable_accessibilityContainerViewIsModal>
        <Dialog.Overlay isCloseOnPress={false} />
        <Dialog.Content
          className="gap-5"
          isSwipeable={false}
          style={PAGE_MODAL_SURFACE_STYLE}
        >
          <View className="gap-1.5">
            <Dialog.Title>{resolvedModalTexts.title}</Dialog.Title>
            <Dialog.Description>
              {resolvedModalTexts.description}
            </Dialog.Description>
          </View>
          <View className="flex-row justify-end gap-3">
            <HapticButton size="sm" variant="ghost" onPress={cancelNavigation}>
              {resolvedModalTexts.cancelLabel}
            </HapticButton>
            <HapticButton
              size="sm"
              variant="danger"
              onPress={confirmNavigation}
            >
              {resolvedModalTexts.confirmLabel}
            </HapticButton>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
