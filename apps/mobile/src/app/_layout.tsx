import "../../global.css";
import "@/services/i18n/i18n";

import { Slot } from "expo-router";
import { HeroUINativeProvider } from "heroui-native/provider";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <Slot />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
