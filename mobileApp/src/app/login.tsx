import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Brand, Button, Field, Glass, Mark, Notice, Screen, Wordmark } from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "@/lib/config";

WebBrowser.maybeCompleteAuthSession();

const PLACEHOLDER_CLIENT = "000000000000-vacaypayplaceholder000000000000.apps.googleusercontent.com";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState<"otp" | "verify" | "google" | null>(null);
  const [error, setError] = useState("");
  const [previewCode, setPreviewCode] = useState("");

  const googleReady = Boolean(GOOGLE_WEB_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID || GOOGLE_IOS_CLIENT_ID);
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID || PLACEHOLDER_CLIENT,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID || PLACEHOLDER_CLIENT,
    iosClientId: GOOGLE_IOS_CLIENT_ID || GOOGLE_WEB_CLIENT_ID || PLACEHOLDER_CLIENT,
  });

  useEffect(() => {
    if (response?.type !== "success") return;
    const idToken = response.params.id_token ?? response.authentication?.idToken;
    const accessToken = response.authentication?.accessToken;
    if (!idToken && !accessToken) {
      setError("Google did not return a sign-in token");
      return;
    }
    setBusy("google");
    setError("");
    api
      .google({ idToken, accessToken })
      .then(({ token, user }) => signIn(token, user))
      .then(() => router.replace("/(tabs)/groups"))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Google sign-in failed"))
      .finally(() => setBusy(null));
  }, [response, router, signIn]);

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
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <View style={styles.brandRow}>
              <Mark />
              <Wordmark size={26} />
            </View>
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
                  disabled={!request || busy !== null}
                  busy={busy === "google"}
                  onPress={() => {
                    if (!googleReady) {
                      setError(
                        "Add EXPO_PUBLIC_GOOGLE_* and GOOGLE_CLIENT_ID to the repo-root .env, then restart the app and server.",
                      );
                      return;
                    }
                    void promptAsync();
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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  body: { paddingHorizontal: 22, paddingTop: 18, gap: 16, paddingBottom: 44 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  heading: { color: Brand.ink, fontSize: 36, fontFamily: "serif", fontWeight: "500", marginTop: -6 },
  sub: { color: Brand.muted, fontSize: 14.5, lineHeight: 22, marginTop: -8 },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  orLine: { flex: 1, height: 1, backgroundColor: Brand.line },
  or: { color: Brand.muted, fontSize: 12.5, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" },
  codeInput: { letterSpacing: 6, fontWeight: "700", fontSize: 20, textAlign: "center" },
});
