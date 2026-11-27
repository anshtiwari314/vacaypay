const fs = require("fs");
const path = require("path");
const { expo } = require("./app.json");

function googleScheme(envKey) {
  const file = path.resolve(__dirname, "..", ".env");
  if (!fs.existsSync(file)) return null;
  const line = fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((raw) => raw.trim())
    .find((raw) => raw.startsWith(`${envKey}=`) || raw.startsWith(`${envKey}:`));
  if (!line) return null;
  const sep = line.indexOf("=") !== -1 ? line.indexOf("=") : line.indexOf(":");
  const value = line.slice(sep + 1).trim().replace(/^["']|["']$/g, "");
  const match = value.match(/^[\w.-]+-([\w-]+)\.apps\.googleusercontent\.com$/);
  return match ? `com.googleusercontent.apps.${match[1]}` : null;
}

function envValue(key) {
  const file = path.resolve(__dirname, "..", ".env");
  if (!fs.existsSync(file)) return "";
  const line = fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((raw) => raw.trim())
    .find((raw) => raw.startsWith(`${key}=`) || raw.startsWith(`${key}:`));
  if (!line) return "";
  const sep = line.indexOf("=") !== -1 ? line.indexOf("=") : line.indexOf(":");
  return line.slice(sep + 1).trim().replace(/^["']|["']$/g, "");
}

const iosUrlScheme =
  googleScheme("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID") || googleScheme("EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID");

/** Google's public sample app ids. The tilde form is the AdMob app id, not an ad unit. */
const TEST_ANDROID_APP_ID = "ca-app-pub-3940256099942544~3347511713";
const TEST_IOS_APP_ID = "ca-app-pub-3940256099942544~1458002511";
const androidAppId = envValue("EXPO_PUBLIC_ADMOB_ANDROID_APP_ID") || TEST_ANDROID_APP_ID;
const iosAppId = envValue("EXPO_PUBLIC_ADMOB_IOS_APP_ID") || TEST_IOS_APP_ID;

const plugins = [...(expo.plugins ?? [])];
if (iosUrlScheme) {
  plugins.push(["@react-native-google-signin/google-signin", { iosUrlScheme }]);
}
plugins.push([
  "expo-location",
  {
    locationWhenInUsePermission:
      "VacayPay uses your location while the app is open, and only if you allow it, so a first sign-in can include where the account was created.",
  },
]);
plugins.push([
  "react-native-google-mobile-ads",
  {
    androidAppId,
    iosAppId,
  },
]);

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...expo,
    plugins,
    "react-native-google-mobile-ads": {
      android_app_id: androidAppId,
      ios_app_id: iosAppId,
    },
  },
};
