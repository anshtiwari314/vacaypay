import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton, Brand, Button, Field, Glass, Notice, Screen } from "@/components/ui";
import { api, ApiError } from "@/lib/api";

export default function CreateGroupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [draft, setDraft] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  function addEmail() {
    const next = draft.trim().toLowerCase();
    if (!next) return;
    if (!emails.includes(next)) setEmails((current) => [...current, next]);
    setDraft("");
  }

  async function create() {
    setBusy(true);
    setError("");
    try {
      const pending = draft.trim().toLowerCase();
      const all = pending && !emails.includes(pending) ? [...emails, pending] : emails;
      const result = await api.createGroup(name, all);
      const failed = result.invites.filter((invite) => !invite.sent);
      if (failed.length) {
        setDone(
          `“${result.group.name}” is created. ${failed.map((invite) => invite.email).join(", ")} will see it after signing in with that email. The invite mail was not sent${failed[0]?.error ? ` (${failed[0].error})` : ""}.`,
        );
      } else if (result.invites.length) {
        setDone(`Invite sent. They’ll see “${result.group.name}” after they sign in.`);
      } else {
        router.back();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the group");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <BackButton label="Groups" />
            <Text style={styles.heading}>New group</Text>
            <Text style={styles.sub}>You are added automatically. Everyone else gets an email.</Text>
            <Glass>
              <Field label="Group name" value={name} onChangeText={setName} placeholder="Goa, June" autoCapitalize="words" />
              <Field
                label="Invite by email"
                value={draft}
                onChangeText={setDraft}
                placeholder="friend@email.com"
                keyboardType="email-address"
                onSubmitEditing={addEmail}
              />
              <Button label="+ Add email" tone="ghost" onPress={addEmail} />
              <View style={styles.chips}>
                {emails.map((email) => (
                  <Pressable key={email} style={styles.chip} onPress={() => setEmails((current) => current.filter((item) => item !== email))}>
                    <Text style={styles.chipText}>{email}  ×</Text>
                  </Pressable>
                ))}
              </View>
            </Glass>
            {error ? <Notice text={error} tone="bad" /> : null}
            {done ? <Notice text={done} /> : null}
            {done ? (
              <Button label="Done" onPress={() => router.back()} />
            ) : (
              <Button label="Create group" onPress={create} busy={busy} />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  body: { padding: 18, gap: 14, paddingBottom: 48 },
  heading: { color: Brand.ink, fontSize: 32, fontFamily: "serif", fontWeight: "500", letterSpacing: -0.5 },
  sub: { color: Brand.muted, lineHeight: 21, fontSize: 14.5, marginTop: -6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "rgba(6,182,212,0.14)",
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.3)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: { color: "#67E8F9", fontWeight: "600", fontSize: 12.5 },
});
