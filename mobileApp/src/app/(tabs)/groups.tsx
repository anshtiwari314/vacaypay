import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HeaderBanner } from "@/components/header-banner";
import {
  Avatar,
  AvatarStack,
  Balance,
  Button,
  DisplayFont,
  Notice,
  SectionLabel,
  ThemeToggle,
  Wordmark,
} from "@/components/ui";
import { api, ApiError, type GroupSummary } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { personName } from "@/lib/money";
import { toneForSeed, useAppTheme } from "@/lib/theme";

export default function GroupsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { colors, isDark } = useAppTheme();
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
  const net = owedToYou - youOwe;
  const settled = Math.abs(net) < 0.005;
  const good = !settled && net > 0;
  const netSign = settled ? "" : good ? "+" : "−";
  const netStatus = settled ? "All settled" : good ? "In the green" : "You owe overall";
  const netMoney = `₹${Math.abs(net).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const owedMoney = `₹${Math.abs(owedToYou).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const oweMoney = `₹${Math.abs(youOwe).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const totalFlow = owedToYou + youOwe;
  const owedRatio = totalFlow > 0 ? Math.max(0.08, Math.min(0.92, owedToYou / totalFlow)) : 0.5;

  const displayName = user ? personName(user) : "Traveler";
  const userInitial = displayName.slice(0, 1).toUpperCase();

  // Distinct homepage palette (separate from login's glowing-orb backdrop)
  const canvasBg = isDark ? "#080B10" : "#F1F5F9";
  const headerDeckBg = isDark ? "#0E1420" : "#FFFFFF";
  const headerDeckBorder = isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(15, 23, 42, 0.06)";
  const surfaceCardBg = isDark ? "#111726" : "#FFFFFF";
  const surfaceBorder = isDark ? "rgba(255, 255, 255, 0.09)" : "rgba(15, 23, 42, 0.07)";

  return (
    <View style={[styles.root, { backgroundColor: canvasBg }]}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
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
          {/* Top Dashboard Deck */}
          <View
            style={[
              styles.headerDeck,
              {
                backgroundColor: headerDeckBg,
                backgroundImage: isDark
                  ? "linear-gradient(180deg, #131B2E 0%, #0D121E 100%)"
                  : "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
                borderBottomColor: headerDeckBorder,
                shadowColor: isDark ? "#000000" : "#0F172A",
                shadowOpacity: isDark ? 0.35 : 0.04,
              },
            ]}>
            <View style={styles.topUtility}>
              <Wordmark size={18} />
              <View style={styles.topActions}>
                <ThemeToggle />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Sign out"
                  onPress={() => {
                    void signOut().then(() => router.replace("/login"));
                  }}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.signOutBtn,
                    { backgroundColor: colors.ghostBg, borderColor: surfaceBorder },
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons name="log-out-outline" size={15} color={colors.inkSoft} />
                  <Text style={[styles.signOutText, { color: colors.inkSoft }]}>Sign out</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.greetingRow}>
              <Avatar seed={user?.email ?? displayName} label={userInitial} size={44} />
              <View style={styles.greetingMeta}>
                <Text style={[styles.greetingKicker, { color: colors.muted }]}>Groups overview</Text>
                <Text numberOfLines={1} style={[styles.greetingTitle, { color: colors.ink }]}>
                  Hi, {displayName}
                </Text>
                {user?.email ? (
                  <Text numberOfLines={1} style={[styles.greetingEmail, { color: colors.muted }]}>
                    {user.email}
                  </Text>
                ) : null}
              </View>
            </View>

            <HeaderBanner />

            {/* Signature Wallet Hero Card */}
            <View
              style={[
                styles.wallet,
                {
                  backgroundColor: isDark ? "#0E1D21" : "#064E3B",
                  backgroundImage: isDark
                    ? "linear-gradient(135deg, #0D2922 0%, #0F1D32 58%, #161832 100%)"
                    : "linear-gradient(135deg, #064E3B 0%, #0F766E 65%, #047857 100%)",
                  borderColor: isDark ? "rgba(34, 245, 158, 0.26)" : "rgba(5, 150, 105, 0.25)",
                  shadowColor: isDark ? "#22F59E" : "#064E3B",
                  shadowOpacity: isDark ? 0.14 : 0.22,
                },
              ]}>
              {isDark ? <View pointerEvents="none" style={styles.walletSpecular} /> : null}
              <View style={styles.walletTop}>
                <Text style={styles.walletLabel}>NET BALANCE</Text>
                <View
                  style={[
                    styles.walletPill,
                    {
                      backgroundColor: isDark
                        ? settled
                          ? "rgba(255,255,255,0.08)"
                          : good
                            ? "rgba(34,245,158,0.16)"
                            : "rgba(251,113,133,0.16)"
                        : "rgba(255,255,255,0.16)",
                      borderColor: isDark
                        ? settled
                          ? "rgba(255,255,255,0.14)"
                          : good
                            ? "rgba(34,245,158,0.32)"
                            : "rgba(251,113,133,0.34)"
                        : "rgba(255,255,255,0.22)",
                    },
                  ]}>
                  <View
                    style={[
                      styles.walletDot,
                      {
                        backgroundColor: isDark
                          ? settled
                            ? "#CBD5E1"
                            : good
                              ? "#22F59E"
                              : "#FB7185"
                          : settled
                            ? "#D1FAE5"
                            : good
                              ? "#6EE7B7"
                              : "#FDA4AF",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.walletPillText,
                      {
                        color: isDark
                          ? settled
                            ? "#E2E8F0"
                            : good
                              ? "#22F59E"
                              : "#FDA4AF"
                          : "#FFFFFF",
                      },
                    ]}>
                    {netStatus}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.walletValue,
                  {
                    color: isDark
                      ? settled
                        ? "#F8FAFC"
                        : good
                          ? "#22F59E"
                          : "#FB7185"
                      : "#FFFFFF",
                  },
                ]}>
                {netSign}
                {netMoney}
              </Text>

              {totalFlow > 0.01 ? (
                <View style={styles.ratioTrack}>
                  {owedToYou > 0.005 ? (
                    <View
                      style={[
                        styles.ratioFill,
                        { flex: owedRatio, backgroundColor: isDark ? "#22F59E" : "#6EE7B7" },
                      ]}
                    />
                  ) : null}
                  {youOwe > 0.005 ? (
                    <View
                      style={[
                        styles.ratioFill,
                        { flex: 1 - owedRatio, backgroundColor: isDark ? "#FB7185" : "#FDA4AF" },
                      ]}
                    />
                  ) : null}
                </View>
              ) : null}

              <View style={styles.walletSplit}>
                <View style={styles.walletStat}>
                  <View style={styles.walletStatHead}>
                    <Ionicons name="arrow-down-circle" size={14} color={isDark ? "#22F59E" : "#6EE7B7"} />
                    <Text style={styles.walletStatLabel}>Owed to you</Text>
                  </View>
                  <Text style={[styles.walletStatValue, { color: isDark ? "#22F59E" : "#ECFDF5" }]}>
                    +{owedMoney}
                  </Text>
                </View>

                <View style={styles.walletDivider} />

                <View style={styles.walletStat}>
                  <View style={styles.walletStatHead}>
                    <Ionicons name="arrow-up-circle" size={14} color={isDark ? "#FB7185" : "#FDA4AF"} />
                    <Text style={styles.walletStatLabel}>You owe</Text>
                  </View>
                  <Text style={[styles.walletStatValue, { color: isDark ? "#FB7185" : "#FFE4E6" }]}>
                    −{oweMoney}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Main Dashboard Body */}
          <View style={styles.sectionBody}>
            {/* Two-Column Quick Actions */}
            <View style={styles.quickRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/create-group")}
                style={({ pressed }) => [
                  styles.quickTile,
                  {
                    backgroundColor: surfaceCardBg,
                    borderColor: surfaceBorder,
                    shadowColor: colors.shadowColor,
                    shadowOpacity: isDark ? 0.28 : 0.05,
                  },
                  pressed && styles.pressed,
                ]}>
                <View style={[styles.quickIcon, { backgroundColor: colors.mossSoft, borderColor: colors.mossBorder }]}>
                  <Ionicons name="people-outline" size={20} color={colors.moss} />
                </View>
                <Text style={[styles.quickTitle, { color: colors.ink }]}>New group</Text>
                <Text style={[styles.quickSub, { color: colors.muted }]}>Start a trip or tab</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/add-expense")}
                style={({ pressed }) => [
                  styles.quickTile,
                  {
                    backgroundColor: surfaceCardBg,
                    borderColor: surfaceBorder,
                    shadowColor: colors.shadowColor,
                    shadowOpacity: isDark ? 0.28 : 0.05,
                  },
                  pressed && styles.pressed,
                ]}>
                <View
                  style={[
                    styles.quickIcon,
                    {
                      backgroundColor: isDark ? "rgba(6, 182, 212, 0.14)" : "rgba(2, 132, 199, 0.10)",
                      borderColor: isDark ? "rgba(6, 182, 212, 0.30)" : "rgba(2, 132, 199, 0.22)",
                    },
                  ]}>
                  <Ionicons name="receipt-outline" size={20} color={colors.cyan} />
                </View>
                <Text style={[styles.quickTitle, { color: colors.ink }]}>Split bill</Text>
                <Text style={[styles.quickSub, { color: colors.muted }]}>Log a quick expense</Text>
              </Pressable>
            </View>

            {error ? <Notice text={error} tone="bad" /> : null}

            <View style={styles.sectionHeader}>
              <SectionLabel>Your trips & tabs</SectionLabel>
              {groups.length > 0 ? (
                <View style={[styles.countPill, { backgroundColor: surfaceCardBg, borderColor: surfaceBorder }]}>
                  <Text style={[styles.countPillText, { color: colors.inkSoft }]}>
                    {groups.length} {groups.length === 1 ? "trip" : "trips"}
                  </Text>
                </View>
              ) : null}
            </View>

            {groups.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: surfaceCardBg,
                    borderColor: surfaceBorder,
                  },
                ]}>
                <View style={[styles.emptyIconWrap, { backgroundColor: colors.mossSoft, borderColor: colors.mossBorder }]}>
                  <Ionicons name="airplane-outline" size={24} color={colors.moss} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.ink }]}>No groups yet</Text>
                <Text style={[styles.emptySub, { color: colors.muted }]}>
                  Create one for a trip, a flat, or dinner. Everyone you invite sees expenses here.
                </Text>
                <View style={styles.emptyAction}>
                  <Button label="Create your first group" onPress={() => router.push("/create-group")} />
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.ledgerSheet,
                  {
                    backgroundColor: surfaceCardBg,
                    borderColor: surfaceBorder,
                    shadowColor: colors.shadowColor,
                    shadowOpacity: isDark ? 0.34 : 0.05,
                  },
                ]}>
                {groups.map((group, index) => {
                  const groupTone = toneForSeed(group.id || group.name, colors);
                  const monogram = group.name.trim().slice(0, 1).toUpperCase() || "G";
                  return (
                    <Pressable
                      key={group.id}
                      accessibilityRole="button"
                      onPress={() => router.push(`/group/${group.id}`)}
                      style={({ pressed }) => [
                        styles.ledgerRow,
                        index > 0 && { borderTopWidth: 1, borderTopColor: surfaceBorder },
                        pressed && { opacity: 0.78 },
                      ]}>
                      <View
                        style={[
                          styles.groupAvatar,
                          {
                            backgroundColor: groupTone.bg,
                            borderColor: groupTone.border,
                          },
                        ]}>
                        <Text style={[styles.groupAvatarText, { color: groupTone.fg }]}>{monogram}</Text>
                      </View>

                      <View style={styles.ledgerCenter}>
                        <Text numberOfLines={1} style={[styles.ledgerTitle, { color: colors.ink }]}>
                          {group.name}
                        </Text>
                        <View style={styles.ledgerMetaRow}>
                          <AvatarStack people={group.members} />
                          <Text style={[styles.ledgerCount, { color: colors.muted }]}>
                            {group.members.length} {group.members.length === 1 ? "person" : "people"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.ledgerRight}>
                        <Balance amount={group.myBalance} />
                        <Ionicons name="chevron-forward" size={15} color={colors.muted} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, backgroundColor: "transparent" },
  body: { paddingBottom: 168 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  headerDeck: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  topUtility: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  topActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  signOutText: { fontSize: 12, fontWeight: "600" },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  greetingMeta: { flex: 1, gap: 1 },
  greetingKicker: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  greetingTitle: {
    fontFamily: DisplayFont,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.6,
  },
  greetingEmail: { fontSize: 12, fontWeight: "500" },
  wallet: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    overflow: "hidden",
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  walletSpecular: {
    position: "absolute",
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
  },
  walletTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  walletLabel: {
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  walletPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  walletDot: { width: 6, height: 6, borderRadius: 3 },
  walletPillText: { fontSize: 11, fontWeight: "700" },
  walletValue: {
    fontFamily: DisplayFont,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -1,
    marginTop: 10,
    marginBottom: 12,
  },
  ratioTrack: {
    height: 5,
    borderRadius: 999,
    flexDirection: "row",
    overflow: "hidden",
    gap: 2,
    marginBottom: 14,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  ratioFill: { height: "100%", borderRadius: 999 },
  walletSplit: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.10)",
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  walletStat: { flex: 1, gap: 4 },
  walletStatHead: { flexDirection: "row", alignItems: "center", gap: 5 },
  walletStatLabel: { color: "rgba(255, 255, 255, 0.74)", fontSize: 11.5, fontWeight: "600" },
  walletStatValue: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  walletDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    marginHorizontal: 12,
  },
  sectionBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
    gap: 14,
  },
  quickRow: {
    flexDirection: "row",
    gap: 11,
  },
  quickTile: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
    gap: 6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  quickTitle: { fontSize: 15, fontWeight: "700", letterSpacing: -0.2 },
  quickSub: { fontSize: 12, fontWeight: "500" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  countPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countPillText: { fontSize: 11, fontWeight: "700" },
  ledgerSheet: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  ledgerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  groupAvatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  groupAvatarText: { fontFamily: DisplayFont, fontSize: 18, fontWeight: "700" },
  ledgerCenter: { flex: 1, gap: 6, minWidth: 0 },
  ledgerTitle: { fontSize: 15.5, fontWeight: "700", letterSpacing: -0.2 },
  ledgerMetaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ledgerCount: { fontSize: 12, fontWeight: "500" },
  ledgerRight: { alignItems: "center", gap: 6, flexDirection: "row" },
  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 10,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontFamily: DisplayFont, fontSize: 18, fontWeight: "700" },
  emptySub: { textAlign: "center", lineHeight: 20, fontSize: 13.5 },
  emptyAction: { width: "100%", marginTop: 8 },
});
