import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { Avatar, Balance, Button, Field, Glass, Notice, Screen, SectionLabel } from "@/components/ui";
import { api, ApiError, type Friend } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { personName } from "@/lib/money";
import { useAppTheme } from "@/lib/theme";

export default function FriendsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { colors, isDark } = useAppTheme();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await api.friends();
      setFriends(result.friends);
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load friends");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function add() {
    setBusy(true);
    setError("");
    setNote("");
    try {
      const result = await api.addFriend(email.trim());
      setEmail("");
      setNote(
        result.invite.sent
          ? `Invite sent to ${result.friend.email}`
          : `${result.friend.email} is on your list. Mail was not sent${result.invite.error ? `: ${result.invite.error}` : "."}`,
      );
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add that friend");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.fill}>
          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                tintColor={colors.moss}
                onRefresh={() => {
                  setRefreshing(true);
                  load().finally(() => setRefreshing(false));
                }}
              />
            }>
            <ScreenHeader
              title="Friends"
              email={user?.email}
              onSignOut={() => {
                void signOut().then(() => router.replace("/login"));
              }}
            />
            <Glass>
              <Field
                label="Add by email"
                leftIcon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="friend@email.com"
                keyboardType="email-address"
              />
              <Button label="Add friend" onPress={add} busy={busy} />
            </Glass>
            {note ? <Notice text={note} /> : null}
            {error ? <Notice text={error} tone="bad" /> : null}
            <SectionLabel>People</SectionLabel>
            {friends.length === 0 ? (
              <Text style={[styles.empty, { color: colors.muted, borderColor: colors.lineStrong }]}>
                People you add, and anyone you split a bill with, show up here.
              </Text>
            ) : (
              friends.map((friend) => {
                const name = personName(friend);
                return (
                  <View
                    key={friend.email}
                    style={[
                      styles.card,
                      {
                        backgroundColor: colors.card,
                        borderColor: isDark ? colors.lineStrong : colors.line,
                        shadowColor: colors.shadowColor,
                        shadowOpacity: isDark ? 0.34 : colors.shadowOpacity,
                        shadowRadius: isDark ? 16 : 12,
                        shadowOffset: { width: 0, height: isDark ? 8 : 4 },
                        elevation: isDark ? 4 : 1,
                      },
                    ]}>
                    <View style={styles.row}>
                      <Avatar seed={friend.email} label={name.slice(0, 1).toUpperCase()} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.name, { color: colors.ink }]}>{name}</Text>
                        <Text style={[styles.email, { color: colors.muted }]}>{friend.email}</Text>
                      </View>
                    </View>
                    <View style={[styles.balanceRow, { borderTopColor: colors.line }]}>
                      <Text style={[styles.balanceLabel, { color: colors.muted }]}>Balance</Text>
                      <Balance amount={friend.balance} />
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  fill: { flex: 1 },
  body: { padding: 18, paddingBottom: 168, gap: 13 },
  card: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { fontSize: 15.5, fontWeight: "700" },
  email: { marginTop: 2, fontSize: 12.5 },
  balanceRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  balanceLabel: { fontSize: 11.5, fontWeight: "600" },
  empty: {
    lineHeight: 21,
    textAlign: "center",
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 18,
  },
});
