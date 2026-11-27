import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { AvatarStack, Balance, Brand, NetCard, Screen, SectionLabel } from "@/components/ui";
import { api, ApiError, type GroupSummary } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function GroupsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await api.groups();
      setGroups(result.groups);
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load groups");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const owedToYou = groups.reduce((sum, group) => sum + (group.myBalance > 0.005 ? group.myBalance : 0), 0);
  const youOwe = groups.reduce((sum, group) => sum + (group.myBalance < -0.005 ? Math.abs(group.myBalance) : 0), 0);

  return (
    <Screen>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.fill}>
          <ScrollView
            contentContainerStyle={styles.body}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                tintColor={Brand.moss}
                onRefresh={() => {
                  setRefreshing(true);
                  load().finally(() => setRefreshing(false));
                }}
              />
            }>
            <ScreenHeader
              title="Groups"
              email={user?.email}
              onSignOut={() => {
                void signOut().then(() => router.replace("/login"));
              }}
            />
            <NetCard owedToYou={owedToYou} youOwe={youOwe} />
            <Pressable style={styles.create} onPress={() => router.push("/create-group")}>
              <View style={styles.createIcon}>
                <Text style={styles.createPlus}>+</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.createTitle}>Create a group</Text>
                <Text style={styles.createSub}>Add people by email. They get a mail and see it in their app.</Text>
              </View>
            </Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <SectionLabel>Your trips & tabs</SectionLabel>
            {groups.length === 0 ? (
              <Text style={styles.empty}>No groups yet. Create one for a trip, a flat, or dinner.</Text>
            ) : (
              groups.map((group) => (
                <Pressable key={group.id} style={styles.card} onPress={() => router.push(`/group/${group.id}`)}>
                  <View style={styles.cardHead}>
                    <Text style={styles.cardTitle}>{group.name}</Text>
                    <Text style={styles.count}>
                      {group.members.length} {group.members.length === 1 ? "person" : "people"}
                    </Text>
                  </View>
                  <View style={styles.cardFoot}>
                    <AvatarStack people={group.members} />
                    <Balance amount={group.myBalance} />
                  </View>
                </Pressable>
              ))
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
  create: {
    backgroundColor: "rgba(34,245,158,0.12)",
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(34,245,158,0.38)",
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: "row",
    gap: 13,
    alignItems: "center",
  },
  createIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.moss,
  },
  createPlus: { color: Brand.onAccent, fontSize: 24, fontWeight: "800", marginTop: -2 },
  createTitle: { color: Brand.ink, fontSize: 15.5, fontWeight: "700" },
  createSub: { color: Brand.muted, marginTop: 2, lineHeight: 17, fontSize: 12.5 },
  card: {
    backgroundColor: Brand.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: Brand.line,
  },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  cardTitle: { color: Brand.ink, fontSize: 17, fontWeight: "700", flex: 1 },
  count: {
    color: Brand.inkSoft,
    fontSize: 11.5,
    fontWeight: "600",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: Brand.line,
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  cardFoot: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  empty: {
    color: Brand.muted,
    lineHeight: 21,
    textAlign: "center",
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Brand.line,
    borderRadius: 18,
  },
  error: { color: Brand.bad },
});
