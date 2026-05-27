import { LogBox } from "react-native";

const ignoredWarningMessages = [
  "Ended a touch event which was not counted in `trackedTouchCount`.",
  "Sending `onAnimatedValueUpdate` with no listeners registered.",
];

declare global {
  var geopotoOriginalConsoleWarn: typeof console.warn | undefined;
}

function getOriginalConsoleWarn() {
  if (globalThis.geopotoOriginalConsoleWarn !== undefined) {
    return globalThis.geopotoOriginalConsoleWarn;
  }

  const originalConsoleWarn: typeof console.warn = console.warn.bind(console);

  globalThis.geopotoOriginalConsoleWarn = originalConsoleWarn;

  return originalConsoleWarn;
}

const originalConsoleWarn = getOriginalConsoleWarn();

function shouldIgnoreWarningMessage(message: string) {
  return ignoredWarningMessages.some((ignoredWarningMessage) =>
    message.includes(ignoredWarningMessage),
  );
}

function shouldIgnoreConsoleWarning(args: readonly unknown[]) {
  const [message] = args;

  if (typeof message !== "string") {
    return false;
  }

  return shouldIgnoreWarningMessage(message);
}

LogBox.ignoreLogs(ignoredWarningMessages);

console.warn = (...args: Parameters<typeof console.warn>) => {
  if (shouldIgnoreConsoleWarning(args)) {
    return;
  }

  originalConsoleWarn(...args);
};
