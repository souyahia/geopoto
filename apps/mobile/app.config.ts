import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Geopoto",
  slug: "geopoto",
  scheme: "geopoto",
  version: "0.0.1",
  platforms: ["ios", "android"],
  plugins: [
    "expo-dev-client",
    "expo-router",
    "expo-localization",
    "expo-image",
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
    infoPlist: {
      CADisableMinimumFrameDurationOnPhone: true, // For 120FPS animations, as recommended here: https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/hooks/keyboard/use-keyboard-handler
    },
  },
  android: {
    package: "souyahia.geopoto.dev",
  },
  experiments: {
    typedRoutes: true,
  },
};

export default config;
