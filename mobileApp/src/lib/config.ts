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
