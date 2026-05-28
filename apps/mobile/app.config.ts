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
  platforms: ["ios", "android"],
  plugins: [
    "expo-dev-client",
    "expo-router",
    "expo-localization",
    "expo-image",
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
    bundleIdentifier: "souyahia.geopoto.dev",
    icon: APP_ICON,
    userInterfaceStyle: "automatic",
    infoPlist: {
      CADisableMinimumFrameDurationOnPhone: true, // For 120FPS animations, as recommended here: https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/hooks/keyboard/use-keyboard-handler
    },
  },
  android: {
    package: "souyahia.geopoto.dev",
    icon: APP_ICON,
  },
  experiments: {
    typedRoutes: true,
  },
};

export default config;
