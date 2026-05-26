import "../../global.css";
import "@/services/i18n/i18n";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useThemeColor } from "heroui-native/hooks";
import { HeroUINativeProvider } from "heroui-native/provider";
import { LogBox, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useSyncThemePreference } from "@/services/theme/sync-theme-preference";
import { useAppTheme } from "@/services/theme/theme";

LogBox.ignoreLogs([
  "Sending `onAnimatedValueUpdate` with no listeners registered.",
]);

function AppRoot() {
  const { theme } = useAppTheme();
  const [backgroundColor] = useThemeColor(["background"]);
  const statusBarStyle = theme === "dark" ? "light" : "dark";

  useSyncThemePreference();

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={statusBarStyle} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="backrooms" options={{ presentation: "modal" }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <AppRoot />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
