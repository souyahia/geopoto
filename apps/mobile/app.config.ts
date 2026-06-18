import type { ExpoConfig } from "expo/config";

import { version } from "./package.json";

// Set via the local dev scripts and the EAS "development" profile so the dev
// build installs alongside the production app instead of overwriting it.
const IS_DEV = process.env.APP_VARIANT === "development";

const APP_ICON = IS_DEV
  ? "./assets/images/geopoto-app-icon-dev.png"
  : "./assets/images/geopoto-app-icon.png";
const SPLASH_ICON = IS_DEV
  ? "./assets/images/geopoto-app-icon-transparent-dev.png"
  : "./assets/images/geopoto-app-icon-transparent.png";
const SPLASH_BACKGROUND_LIGHT = "#fff4f4";
const SPLASH_BACKGROUND_DARK = "#110d0f";

const APP_NAME = IS_DEV ? "Geopoto Dev" : "Geopoto";
// A distinct bundle id/package is what lets both apps coexist on one device.
const BUNDLE_IDENTIFIER = IS_DEV
  ? "com.souyahia.geopoto.dev"
  : "com.souyahia.geopoto";

const config: ExpoConfig = {
  name: APP_NAME,
  slug: "geopoto",
  scheme: "geopoto",
  version,
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
    bundleIdentifier: BUNDLE_IDENTIFIER,
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
    package: BUNDLE_IDENTIFIER,
    icon: APP_ICON,
  },
  experiments: {
    typedRoutes: true,
  },
};

export default config;
