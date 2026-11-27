import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin, isErrorWithCode, statusCodes } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GoogleIcon } from "@/components/google-icon";
import { Button, DisplayFont, Field, Glass, Mark, Notice, Screen, ThemeToggle, Wordmark } from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { clearGoogleSession, configureGoogleSignIn, googleSignInConfigError } from "@/lib/google-auth";
import { readGrantedLocation } from "@/lib/location";
import { useAppTheme } from "@/lib/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState<"otp" | "verify" | "google" | null>(null);
  const [error, setError] = useState("");
  const [previewCode, setPreviewCode] = useState("");

  const googleConfigError = googleSignInConfigError();

  useEffect(() => {
    configureGoogleSignIn();
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
      await clearGoogleSession();
      const result = await GoogleSignin.signIn();
      if (result.type === "cancelled") return;
      const idToken = result.data.idToken;
      if (!idToken) {
        setError("Google did not return an ID token. Check EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.");
        return;
      }
      const location = await readGrantedLocation();
      const session = await api.google({ idToken, location });
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
      const location = await readGrantedLocation();
      const result = await api.verifyOtp(email.trim(), code.trim(), location);
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
            <Wordmark size={23} />
          </View>
          <ThemeToggle />
        </View>

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.signInColumn}>
              <View style={styles.hero}>
                <View style={[styles.eyebrowPill, { backgroundColor: colors.mossSoft, borderColor: colors.mossBorder }]}>
                  <Ionicons
                    name={step === "email" ? "sparkles-outline" : "mail-unread-outline"}
                    size={13}
                    color={colors.moss}
                  />
                  <Text style={[styles.eyebrowText, { color: colors.moss }]}>
                    {step === "email" ? "Effortless group splits" : "Verification code"}
                  </Text>
                </View>

                <Text style={[styles.heading, { color: colors.ink }]}>
                  {step === "email" ? "Split trips,\nnot friendships." : "Check your email"}
                </Text>

                {step === "email" ? (
                  <Text style={[styles.sub, { color: colors.muted }]}>
                    Use a one-time code, or continue with Google. The same email sees the groups you were added to.
                  </Text>
                ) : (
                  <View style={styles.codeSubWrap}>
                    <Text style={[styles.sub, { color: colors.muted }]}>Enter the 6-digit code sent to</Text>
                    <View style={[styles.emailChip, { backgroundColor: colors.cardSubtle, borderColor: colors.lineStrong }]}>
                      <Ionicons name="mail-outline" size={14} color={colors.moss} />
                      <Text style={[styles.emailChipText, { color: colors.ink }]}>{email.trim()}</Text>
                    </View>
                  </View>
                )}
              </View>

              {error ? <Notice text={error} tone="bad" /> : null}
              {previewCode ? (
                <Notice text={`Mail isn't configured yet, so use this code: ${previewCode}`} />
              ) : null}

              {step === "email" ? (
                <Glass style={styles.authCard}>
                  <Field
                    label="Email"
                    leftIcon="mail-outline"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoComplete="email"
                    placeholder="you@email.com"
                  />
                  <Button
                    label="Email me a code"
                    onPress={sendCode}
                    busy={busy === "otp"}
                    icon={<Ionicons name="arrow-forward" size={17} color={colors.onAccent} />}
                  />
                  <View style={styles.orRow}>
                    <View style={[styles.orLine, { backgroundColor: colors.lineStrong }]} />
                    <Text style={[styles.or, { color: colors.muted }]}>or</Text>
                    <View style={[styles.orLine, { backgroundColor: colors.lineStrong }]} />
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
                <Glass style={styles.authCard}>
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
                    icon={<Ionicons name="arrow-back" size={16} color={colors.inkSoft} />}
                    onPress={() => {
                      setStep("email");
                      setCode("");
                      setError("");
                    }}
                  />
                </Glass>
              )}

              <View style={styles.footerNote}>
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.muted} />
                <Text style={[styles.footerText, { color: colors.muted }]}>
                  Passwordless sign-in · Synced to your email
                </Text>
              </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 10,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  body: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 32,
  },
  signInColumn: {
    width: "100%",
    maxWidth: 410,
    gap: 18,
    alignSelf: "center",
  },
  hero: {
    gap: 12,
    alignItems: "flex-start",
  },
  eyebrowPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  eyebrowText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  heading: {
    fontFamily: DisplayFont,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "700",
    letterSpacing: -1,
  },
  sub: {
    fontSize: 14.5,
    lineHeight: 22,
  },
  codeSubWrap: {
    gap: 8,
    alignItems: "flex-start",
  },
  emailChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  emailChipText: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  authCard: {
    padding: 20,
    gap: 15,
  },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  orLine: { flex: 1, height: 1 },
  or: { fontSize: 11.5, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase" },
  codeInput: { letterSpacing: 8, fontWeight: "700", fontSize: 22, textAlign: "center" },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 4,
  },
  footerText: { fontSize: 12.5, fontWeight: "500" },
});
