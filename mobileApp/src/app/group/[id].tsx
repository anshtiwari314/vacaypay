import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddExpenseButton, Avatar, BackButton, Balance, DisplayFont, Screen, SectionLabel } from "@/components/ui";
import { api, ApiError, type GroupDetail } from "@/lib/api";
import { formatMoney, personName } from "@/lib/money";
import { useAppTheme } from "@/lib/theme";

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function GroupScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = param(id) ?? "";
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [error, setError] = useState("");
  const [peopleOpen, setPeopleOpen] = useState(false);

  const load = useCallback(async () => {
    if (!groupId) return;
    try {
      const result = await api.group(groupId);
      setGroup(result.group);
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not open this group");
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const totalSpend = group?.expenses.reduce((sum, expense) => sum + expense.amount, 0) ?? 0;

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.body}>
          <BackButton label="Groups" />
          {group ? (
            <View
              style={[
                styles.hero,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.mossBorder,
                  shadowColor: isDark ? colors.moss : colors.shadowColor,
                  shadowOpacity: isDark ? 0.14 : colors.shadowOpacity,
                  shadowRadius: isDark ? 18 : 14,
                  shadowOffset: { width: 0, height: isDark ? 8 : 6 },
                  elevation: isDark ? 5 : 2,
                },
              ]}>
              <View style={styles.heroMeta}>
                <Text style={[styles.heading, { color: colors.ink }]}>{group.name}</Text>
                <Balance amount={group.myBalance} />
              </View>
              <View style={[styles.spend, { backgroundColor: colors.cardSubtle, borderColor: colors.line }]}>
                <Text style={[styles.spendLabel, { color: colors.muted }]}>Total group spend</Text>
                <Text style={[styles.spendValue, { color: colors.ink }]}>{formatMoney(totalSpend)}</Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.heading, { color: colors.ink }]}>Group</Text>
          )}
          {error ? <Text style={[styles.error, { color: colors.bad }]}>{error}</Text> : null}
          {group ? (
            <Pressable
              style={[styles.peopleRow, { backgroundColor: colors.card, borderColor: colors.line }]}
              onPress={() => setPeopleOpen((open) => !open)}>
              <Text style={[styles.peopleLabel, { color: colors.ink }]}>
                {group.members.length} {group.members.length === 1 ? "person" : "people"} in this group
              </Text>
              <Text style={[styles.chevron, { color: colors.moss }]}>{peopleOpen ? "▾" : "▸"}</Text>
            </Pressable>
          ) : null}
          {peopleOpen && group ? (
            <View style={[styles.roster, { backgroundColor: colors.card, borderColor: colors.line }]}>
              {group.members.map((member, index) => {
                const named = member.name?.trim();
                const mark = (named || member.email).slice(0, 1).toUpperCase();
                return (
                  <View
                    key={member.email}
                    style={[
                      styles.personCard,
                      { borderTopColor: colors.line },
                      index === 0 && { borderTopWidth: 0 },
                    ]}>
                    <Avatar seed={member.email} label={mark} size={34} />
                    <View style={{ flex: 1 }}>
                      {named ? <Text style={[styles.personName, { color: colors.ink }]}>{named}</Text> : null}
                      <Text
                        style={
                          named
                            ? [styles.personEmail, { color: colors.muted }]
                            : [styles.personEmailOnly, { color: colors.ink }]
                        }>
                        {member.email}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
          <SectionLabel>Expenses</SectionLabel>
          {group && group.expenses.length === 0 ? (
            <Text style={[styles.empty, { color: colors.muted, borderColor: colors.lineStrong }]}>
              No expenses yet. Tap below to split the first bill.
            </Text>
          ) : null}
          {group?.expenses.map((expense) => (
            <Pressable
              key={expense.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}
              onPress={() => router.push(`/add-expense?groupId=${group.id}&expenseId=${expense.id}`)}>
              <View style={styles.row}>
                <Text style={[styles.expense, { color: colors.ink }]}>{expense.description}</Text>
                <Text style={[styles.amount, { color: colors.ink }]}>{formatMoney(expense.amount)}</Text>
              </View>
              <Text style={[styles.muted, { color: colors.muted }]}>
                {personName({ name: expense.paidByName, email: expense.paidByEmail })} paid ·{" "}
                {new Date(expense.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </Text>
              <Balance amount={expense.myBalance} />
            </Pressable>
          ))}
        </ScrollView>
        {group ? <AddExpenseButton bottom={28} href={`/add-expense?groupId=${group.id}`} /> : null}
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  body: { padding: 18, gap: 12, paddingBottom: 110 },
  hero: {
    borderRadius: 24,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  heroMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  heading: { fontSize: 30, fontFamily: DisplayFont, fontWeight: "700", letterSpacing: -0.7, flexShrink: 1 },
  spend: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  spendLabel: { fontSize: 12, fontWeight: "600" },
  spendValue: { fontSize: 16, fontWeight: "800" },
  peopleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderWidth: 1,
  },
  peopleLabel: { fontWeight: "700", fontSize: 14.5 },
  chevron: { fontSize: 14, fontWeight: "700" },
  roster: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  personCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
  },
  personName: { fontWeight: "700", fontSize: 14 },
  personEmail: { marginTop: 1, fontSize: 12 },
  personEmailOnly: { fontWeight: "600", fontSize: 14 },
  card: { borderRadius: 20, padding: 15, borderWidth: 1, gap: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  expense: { fontWeight: "700", fontSize: 15.5, flex: 1 },
  amount: { fontWeight: "800", fontSize: 15.5 },
  muted: { marginTop: 4, marginBottom: 8, fontSize: 12.5 },
  empty: {
    lineHeight: 21,
    textAlign: "center",
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 18,
  },
  error: {},
});
