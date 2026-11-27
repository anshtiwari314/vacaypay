import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "vacaypay_token";
const THEME_KEY = "vacaypay_theme";

export type StoredThemeMode = "light" | "dark";

export async function getToken() {
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(KEY) ?? null;
  }
  return SecureStore.getItemAsync(KEY);
}

export async function setToken(token: string) {
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(KEY, token);
    return;
  }
  await SecureStore.setItemAsync(KEY, token);
}

export async function clearToken() {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(KEY);
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}

export async function getThemePreference(): Promise<StoredThemeMode | null> {
  try {
    const raw =
      Platform.OS === "web"
        ? globalThis.localStorage?.getItem(THEME_KEY) ?? null
        : await SecureStore.getItemAsync(THEME_KEY);
    return raw === "light" || raw === "dark" ? raw : null;
  } catch {
    return null;
  }
}

export async function setThemePreference(mode: StoredThemeMode): Promise<void> {
  try {
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(THEME_KEY, mode);
      return;
    }
    await SecureStore.setItemAsync(THEME_KEY, mode);
  } catch {
    // Ignore storage errors for non-critical theme preference.
  }
}
