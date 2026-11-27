import * as Device from "expo-device";
import { Platform } from "react-native";

const LAN_HOST = "http://192.168.1.37:3000";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "web"
    ? "http://localhost:3000"
    : Platform.OS === "android" && !Device.isDevice
      ? "http://10.0.2.2:3000"
      : LAN_HOST);

export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "";
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";

/** Google's public sample ids. Safe for development. Replace before a store release. */
const TEST_ANDROID_INTERSTITIAL = "ca-app-pub-3940256099942544/1033173712";
const TEST_IOS_INTERSTITIAL = "ca-app-pub-3940256099942544/4411468910";
const TEST_ANDROID_BANNER = "ca-app-pub-3940256099942544/6300978111";
const TEST_IOS_BANNER = "ca-app-pub-3940256099942544/2934735716";

export const INTERSTITIAL_AD_UNIT_ID =
  (Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID
    : process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID) ||
  (Platform.OS === "ios" ? TEST_IOS_INTERSTITIAL : TEST_ANDROID_INTERSTITIAL);

export const BANNER_AD_UNIT_ID =
  (Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID
    : process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID) ||
  (Platform.OS === "ios" ? TEST_IOS_BANNER : TEST_ANDROID_BANNER);

export const INTERSTITIAL_INTERVAL_MS = 5 * 60 * 1000;
export const BANNER_REFRESH_INTERVAL_MS = 3.5 * 60 * 1000;
