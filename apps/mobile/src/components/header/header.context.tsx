import {
  createContext,
  useCallback,
  useMemo,
  useContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import type { LayoutChangeEvent } from "react-native";

interface HeaderContextValue {
  onCenterLayout: (event: LayoutChangeEvent) => void;
}

const HeaderContext = createContext<HeaderContextValue | null>(null);

interface HeaderProviderProps {
  onUpdateCenterHeight: Dispatch<SetStateAction<number>>;
}

export function HeaderProvider({
  onUpdateCenterHeight,
  children,
}: PropsWithChildren<HeaderProviderProps>) {
  const handleCenterLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const nextCenterHeight = event.nativeEvent.layout.height;

      onUpdateCenterHeight((currentCenterHeight) => {
        if (currentCenterHeight === nextCenterHeight) {
          return currentCenterHeight;
        }

        return nextCenterHeight;
      });
    },
    [onUpdateCenterHeight],
  );

  const contextValue = useMemo(
    () => ({
      onCenterLayout: handleCenterLayout,
    }),
    [handleCenterLayout],
  );

  return (
    <HeaderContext.Provider value={contextValue}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeaderContext() {
  const context = useContext(HeaderContext);

  if (!context) {
    throw new Error("useHeaderContext must be used within a HeaderProvider");
  }

  return context;
}
