# Geopoto Mobile

React Native app built with [Expo](https://expo.dev/) SDK 55 using custom development builds via `expo-dev-client`.

## Prerequisites

1. Install dependencies from the monorepo root:

   ```bash
   pnpm install
   ```

2. Set up your development environment for your target platform:
   - **iOS**: Install [Xcode](https://apps.apple.com/app/xcode/id497799835) from the App Store. Once installed, open it and install the iOS simulator runtime when prompted. You also need the Xcode Command Line Tools (`xcode-select --install`).
   - **Android**: Install [Android Studio](https://developer.android.com/studio). Once installed, open it and make sure to install the Android SDK and set up an emulator, or enable USB debugging on a physical device.

   See the [Expo environment setup guide](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&buildEnv=local) for detailed instructions.

## Getting Started

First time setup requires a full build:

```bash
pnpm build:ios
pnpm build:android
```

After the initial build, you can start the dev server:

```bash
pnpm start
```

## Scripts

| Script             | Command                                   | Description                                                                                                                                            |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `start`            | `expo start`                              | Starts the Metro JS bundler and dev server. Use this for everyday development after an initial build.                                                  |
| `ios`              | `expo run:ios`                            | Compiles the native iOS project and launches it on a simulator or connected device. Assumes `prebuild:ios` has already been run.                       |
| `android`          | `expo run:android`                        | Compiles the native Android project and launches it on an emulator or connected device. Assumes `prebuild:android` has already been run.               |
| `prebuild:ios`     | `expo prebuild --clean --pnpm -p ios`     | Generates or regenerates the native `ios/` directory from the Expo config. Use this after adding a native dependency or modifying `app.config.ts`.     |
| `prebuild:android` | `expo prebuild --clean --pnpm -p android` | Generates or regenerates the native `android/` directory from the Expo config. Use this after adding a native dependency or modifying `app.config.ts`. |
| `build:ios`        | prebuild and run                          | Shortcut that prebuilds and compiles for iOS in one step. Use for first time setup or after native config changes.                                     |
| `build:android`    | prebuild and run                          | Shortcut that prebuilds and compiles for Android in one step. Use for first time setup or after native config changes.                                 |

## When to Rebuild

- **JS only changes**: No rebuild needed. The dev server (`pnpm start`) hot reloads automatically.
- **New native dependency added**: Run `pnpm build:ios` or `pnpm build:android`.
- **Changed `app.config.ts`**: Run `pnpm build:ios` or `pnpm build:android`.
- **Otherwise**: Use `pnpm ios` or `pnpm android` to recompile without a full prebuild.
