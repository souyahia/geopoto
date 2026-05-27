import { create } from "zustand";

export interface NavigationConfirmModalTexts {
  cancelLabel?: string;
  confirmLabel?: string;
  description?: string;
  title?: string;
}

interface ShowNavigationConfirmModalParams {
  modalTexts: NavigationConfirmModalTexts;
  onCancel: () => void;
  onConfirm: () => void;
}

export interface NavigationConfirmStore {
  cancelNavigation: () => void;
  confirmNavigation: () => void;
  isModalVisible: boolean;
  modalTexts: NavigationConfirmModalTexts;
  showNavigationConfirmModal: (
    params: ShowNavigationConfirmModalParams,
  ) => void;
}

interface NavigationConfirmStoreState extends NavigationConfirmStore {
  onCancel: () => void;
  onConfirm: () => void;
}

const EMPTY_MODAL_TEXTS: NavigationConfirmModalTexts = {};
const noop = () => {};

const getIdleState = () => ({
  isModalVisible: false,
  modalTexts: EMPTY_MODAL_TEXTS,
  onCancel: noop,
  onConfirm: noop,
});

export const useNavigationConfirmStore = create<NavigationConfirmStoreState>(
  (set, get) => ({
    ...getIdleState(),
    cancelNavigation: () => {
      const { onCancel } = get();

      set(getIdleState());
      onCancel();
    },
    confirmNavigation: () => {
      const { onConfirm } = get();

      set(getIdleState());
      onConfirm();
    },
    showNavigationConfirmModal: ({ modalTexts, onCancel, onConfirm }) => {
      set({
        isModalVisible: true,
        modalTexts,
        onCancel,
        onConfirm,
      });
    },
  }),
);
