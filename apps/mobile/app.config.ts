import type { ExpoConfig } from "expo/config";

const APP_ICON = "./assets/images/geopoto-app-icon.png";
const SPLASH_ICON = "./assets/images/geopoto-app-icon-transparent.png";
const SPLASH_BACKGROUND_LIGHT = "#fff4f4";
const SPLASH_BACKGROUND_DARK = "#110d0f";

const config: ExpoConfig = {
  name: "Geopoto",
  slug: "geopoto",
  scheme: "geopoto",
  version: "0.0.1",
  icon: APP_ICON,
  orientation: "portrait",
  platforms: ["ios", "android"],
  extra: {
    eas: {
      projectId: "f206006c-d47d-4905-8b6f-b2736c2fe456",
    },
  },
  plugins: [
    "expo-dev-client",
    "expo-router",
    "expo-localization",
    "expo-image",
    "expo-sqlite",
    [
      "expo-notifications",
      {
        defaultChannel: "daily-challenge-reminders",
      },
    ],
    [
      "expo-splash-screen",
      {
        image: SPLASH_ICON,
        imageWidth: 95,
        resizeMode: "contain",
        backgroundColor: SPLASH_BACKGROUND_LIGHT,
        dark: {
          image: SPLASH_ICON,
          backgroundColor: SPLASH_BACKGROUND_DARK,
        },
      },
    ],
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "16.0",
        },
      },
    ],
  ],
  ios: {
    bundleIdentifier: "com.souyahia.geopoto",
    icon: APP_ICON,
    requireFullScreen: true,
    supportsTablet: true,
    userInterfaceStyle: "automatic",
    infoPlist: {
      CADisableMinimumFrameDurationOnPhone: true, // For 120FPS animations, as recommended here: https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/hooks/keyboard/use-keyboard-handler
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.souyahia.geopoto",
    icon: APP_ICON,
  },
  experiments: {
    typedRoutes: true,
  },
};

export default config;
