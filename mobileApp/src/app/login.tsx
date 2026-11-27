import { GoogleSignin, isErrorWithCode, statusCodes } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GoogleIcon } from "@/components/google-icon";
import { Brand, Button, Field, Glass, Mark, Notice, Screen, Wordmark } from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "@/lib/config";
import { googleSignInConfigError } from "@/lib/google-auth";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState<"otp" | "verify" | "google" | null>(null);
  const [error, setError] = useState("");
  const [previewCode, setPreviewCode] = useState("");

  const googleConfigError = googleSignInConfigError();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
      iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    });
  }, []);

  async function continueWithGoogle() {
    if (googleConfigError) {
      setError(googleConfigError);
      return;
    }
    setBusy("google");
    setError("");
    try {
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }
      const result = await GoogleSignin.signIn();
      if (result.type === "cancelled") return;
      const idToken = result.data.idToken;
      if (!idToken) {
        setError("Google did not return an ID token. Check EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.");
        return;
      }
      const session = await api.google({ idToken });
      await signIn(session.token, session.user);
      router.replace("/(tabs)/groups");
    } catch (err) {
      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (isErrorWithCode(err) && err.code === statusCodes.IN_PROGRESS) {
        setError("Google sign-in is already open.");
        return;
      }
      if (isErrorWithCode(err) && err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError("Install or update Google Play services, then try again.");
        return;
      }
      if (isErrorWithCode(err) && err.code === "10") {
        setError(
          "Google rejected this Android build. The Android OAuth client must use package com.vacaypay and the SHA-1 of the keystore from npx expo run:android.",
        );
        return;
      }
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(null);
    }
  }

  async function sendCode() {
    setBusy("otp");
    setError("");
    setPreviewCode("");
    try {
      const result = await api.requestOtp(email.trim());
      setStep("code");
      if (result.previewCode) setPreviewCode(result.previewCode);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send the code");
    } finally {
      setBusy(null);
    }
  }

  async function verify() {
    setBusy("verify");
    setError("");
    try {
      const result = await api.verifyOtp(email.trim(), code.trim());
      await signIn(result.token, result.user);
      router.replace("/(tabs)/groups");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not verify the code");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Mark />
            <Wordmark size={26} />
          </View>
        </View>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.signInColumn}>
              <Text style={styles.heading}>{step === "email" ? "Sign in" : "Check your email"}</Text>
              <Text style={styles.sub}>
                {step === "email"
                  ? "Use a one-time code, or continue with Google. The same email sees the groups you were added to."
                  : `Enter the 6-digit code sent to ${email.trim()}.`}
              </Text>

              {error ? <Notice text={error} tone="bad" /> : null}
              {previewCode ? (
                <Notice text={`Mail isn't configured yet, so use this code: ${previewCode}`} />
              ) : null}

              {step === "email" ? (
              <Glass>
                <Field
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoComplete="email"
                  placeholder="you@email.com"
                />
                <Button label="Email me a code" onPress={sendCode} busy={busy === "otp"} />
                <View style={styles.orRow}>
                  <View style={styles.orLine} />
                  <Text style={styles.or}>or</Text>
                  <View style={styles.orLine} />
                </View>
                <Button
                  label="Continue with Google"
                  tone="ghost"
                  disabled={busy !== null}
                  busy={busy === "google"}
                  icon={<GoogleIcon size={20} />}
                  onPress={() => {
                    void continueWithGoogle();
                  }}
                />
              </Glass>
            ) : (
              <Glass>
                <Field
                  label="6-Digit Code"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  placeholder="000000"
                  maxLength={6}
                  inputStyle={styles.codeInput}
                />
                <Button label="Sign in" onPress={verify} busy={busy === "verify"} />
                <Button
                  label="Use a different email"
                  tone="ghost"
                  onPress={() => {
                    setStep("email");
                    setCode("");
                    setError("");
                  }}
                />
              </Glass>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 8,
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  body: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 72,
  },
  signInColumn: {
    width: "100%",
    maxWidth: 400,
    gap: 16,
    alignSelf: "center",
    transform: [{ translateY: -36 }],
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  heading: {
    color: Brand.ink,
    fontSize: 36,
    fontFamily: "serif",
    fontWeight: "500",
    textAlign: "center",
    alignSelf: "stretch",
  },
  sub: {
    color: Brand.muted,
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: "left",
    alignSelf: "stretch",
  },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  orLine: { flex: 1, height: 1, backgroundColor: Brand.line },
  or: { color: Brand.muted, fontSize: 12.5, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" },
  codeInput: { letterSpacing: 6, fontWeight: "700", fontSize: 20, textAlign: "center" },
});
