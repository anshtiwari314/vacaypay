import { Platform } from "react-native";

import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "@/lib/config";

/**
 * Native Google Sign-In does not use a browser redirect.
 * The Web client id is only the audience of the ID token (`requestIdToken`).
 * The Android OAuth client is package name + SHA-1 in Google Cloud, not a redirect URI.
 */
export function googleSignInConfigError(): string | null {
  if (Platform.OS === "web") {
    return "Google sign-in on the website is not set up. Use the Android app, or the email code.";
  }
  if (!GOOGLE_WEB_CLIENT_ID) {
    return "Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and GOOGLE_CLIENT_ID_WEB to the same Web OAuth client id. That id is only used to issue an ID token. It does not open a browser. The Android OAuth client still needs package com.vacaypay and this build's SHA-1.";
  }
  if (Platform.OS === "ios" && !GOOGLE_IOS_CLIENT_ID) {
    return "Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in the repo-root .env.";
  }
  return null;
}
