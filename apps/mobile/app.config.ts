import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Geopoto",
  slug: "geopoto",
  scheme: "geopoto",
  version: "0.0.1",
  platforms: ["ios", "android"],
  plugins: ["expo-dev-client", "expo-router", "expo-localization"],
  ios: {
    bundleIdentifier: "com.souyahia.geopoto",
  },
  android: {
    package: "com.souyahia.geopoto",
  },
  experiments: {
    typedRoutes: true,
  },
};

export default config;
