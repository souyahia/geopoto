import { Dialog } from "heroui-native/dialog";
import { Trash2 } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { HapticButton } from "@/components/haptic-button";
import { PAGE_MODAL_SURFACE_STYLE } from "@/components/page-content";
import { useTrainingProgram } from "@/modules/training-program/utils/training-program-storage";
import { ThemedIcon } from "@/services/theme/themed-icon";

/**
 * The "cancel program" action for the Active overview. On confirm it clears the
 * program snapshot via issue 002's `cancelProgram`; the reactive section
 * container then re-renders the No Program state on its own.
 */
export function CancelProgramAction() {
  const { t } = useTranslation();
  const { cancelProgram } = useTrainingProgram();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setIsDialogOpen(isOpen);
  };

  const handleCancelPress = () => {
    setIsDialogOpen(false);
  };

  const handleConfirmPress = () => {
    setIsDialogOpen(false);
    cancelProgram();
  };

  return (
    <Dialog isOpen={isDialogOpen} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <HapticButton variant="ghost">
          <ThemedIcon colorClassName="text-danger" icon={Trash2} size={18} />
          <HapticButton.Label className="text-danger">
            {t("training-program.active.cancel.action")}
          </HapticButton.Label>
        </HapticButton>
      </Dialog.Trigger>
      <Dialog.Portal unstable_accessibilityContainerViewIsModal>
        <Dialog.Overlay isCloseOnPress={false} />
        <Dialog.Content
          className="gap-5"
          isSwipeable={false}
          style={PAGE_MODAL_SURFACE_STYLE}
        >
          <View className="gap-1.5">
            <Dialog.Title>
              {t("training-program.active.cancel.confirm.title")}
            </Dialog.Title>
            <Dialog.Description>
              {t("training-program.active.cancel.confirm.description")}
            </Dialog.Description>
          </View>
          <View className="flex-row justify-end gap-3">
            <HapticButton size="sm" variant="ghost" onPress={handleCancelPress}>
              {t("training-program.active.cancel.confirm.cancel-label")}
            </HapticButton>
            <HapticButton
              size="sm"
              variant="danger"
              onPress={handleConfirmPress}
            >
              {t("training-program.active.cancel.confirm.confirm-label")}
            </HapticButton>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
