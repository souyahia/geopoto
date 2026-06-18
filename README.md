<div align="center">
  <img src="https://raw.githubusercontent.com/souyahia/geopoto/main/apps/mobile/assets/images/geopoto_illustration.png" alt="Geopoto illustration" width="360" />

  <h1>Geopoto</h1>

  <p>
    A fully offline mobile app for learning flags, capitals, countries and map positions through daily challenges, adaptive training and an interactive geography atlas.
  </p>

  <p>
    <a href="https://apps.apple.com/fr/app/geopoto/id6775186079">
      <img alt="Download on the App Store" src="https://img.shields.io/badge/App_Store-Download-0D96F6?style=for-the-badge&logo=apple&logoColor=white" />
    </a>
    <img alt="Google Play coming soon" src="https://img.shields.io/badge/Google_Play-Coming_soon-9E9E9E?style=for-the-badge&logo=googleplay&logoColor=white" />
  </p>
</div>

## Screenshots

<div align="center">
  <img src="https://raw.githubusercontent.com/souyahia/geopoto/main/stores/screenshots/store_screenshot_1.jpg" alt="Home" width="200" />
  <img src="https://raw.githubusercontent.com/souyahia/geopoto/main/stores/screenshots/store_screenshot_4.jpg" alt="Adaptive training" width="200" />
  <img src="https://raw.githubusercontent.com/souyahia/geopoto/main/stores/screenshots/store_screenshot_6.jpg" alt="Interactive map" width="200" />
  <img src="https://raw.githubusercontent.com/souyahia/geopoto/main/stores/screenshots/store_screenshot_5.jpg" alt="Encyclopedia" width="200" />
</div>

## About

Geopoto is built for people who want geographic knowledge to stick. It keeps the full learning experience offline, including generated country data, maps, flags, localized names and capitals.

The app combines quick practice sessions with a daily habit loop. Users can train on country names, capitals, flags and map positions, browse a learning encyclopedia, inspect an interactive world map and come back each day for a fresh challenge.

## Features

- **Offline geography data**: learn from 197 countries and flags without relying on a network connection.
- **Daily Challenge**: one shared geography puzzle per day with streak tracking and optional local reminders.
- **Adaptive training**: practice history stays on device and helps prioritize questions the user misses more often.
- **Custom quiz sessions**: choose regions, question formats, answer formats, flag answer difficulty, question limits and infinite mode.
- **Interactive map explorer**: pan, zoom, select countries and connect names with real map positions.
- **Learning encyclopedia**: browse countries, capitals and flags, with search and flag color filters.
- **Localized experience**: app UI and geographic names support English, French, German, Spanish, Italian and Portuguese.
- **Mobile native feel**: haptics, local notifications, dark mode, keyboard-aware layouts and smooth map rendering.

## Tech Stack

- [Expo](https://expo.dev/) SDK 55
- React Native 0.83
- Expo Router
- TypeScript
- React Native Skia for map rendering
- MMKV and SQLite for local storage
- i18next for localization
- pnpm workspaces and Turborepo

## Repository Structure

```text
.
├── apps
│   └── mobile          # Expo React Native app
├── packages
│   └── geo-data        # Generated country, flag and map data
├── stores
│   ├── content         # Localized store listing copy
│   ├── icons           # App and store icons
│   ├── images          # Marketing images
│   └── screenshots     # Store screenshots
└── tooling             # Shared tooling packages
```

## Requirements

- Node.js 22
- pnpm 10.26.1
- Xcode for iOS development
- Android Studio for Android development

For native setup details, follow the Expo environment guide for custom development builds.

## Getting Started

Install dependencies from the repository root:

```bash
pnpm install
```

Start the Expo dev server:

```bash
pnpm start
```

Use the local or LAN variants when needed:

```bash
pnpm start:local
pnpm start:lan
```

## Native Builds

Geopoto uses `expo-dev-client`, so the first run on a simulator or device needs a native build.

Run iOS:

```bash
pnpm -C apps/mobile build:ios
```

Run Android:

```bash
pnpm -C apps/mobile build:android
```

After the first build, everyday JavaScript and TypeScript changes can usually use the dev server:

```bash
pnpm start
```

Rebuild the native app after changing native dependencies, Expo config, notification settings, app icons or build properties.

## Quality Checks

Run the full project check:

```bash
pnpm check
```

Run individual checks:

```bash
pnpm lint
pnpm format
pnpm typecheck
pnpm test
```

Apply formatting fixes:

```bash
pnpm format:fix
```

## Store Listing

Localized App Store and Google Play copy lives in `stores/content`, with marketing assets in `stores/icons`, `stores/images` and `stores/screenshots`.

## Links

- [App Store](https://apps.apple.com/fr/app/geopoto/id6775186079)
- [Privacy Policy](https://doc-hosting.flycricket.io/geopoto-privacy-policy/51dd5aaf-4af9-410c-a1b0-46b3bd5b5f47/privacy)
- [Terms of Use](https://doc-hosting.flycricket.io/geopoto-terms-of-use/34b0bdc1-57a3-4e10-8bbd-aac9f884f0a5/terms)
</content>
</invoke>
