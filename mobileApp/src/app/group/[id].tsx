import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

import { AddExpenseButton, Avatar, BackButton, Balance, Brand, Screen, SectionLabel } from "@/components/ui";
import { api, ApiError, type GroupDetail } from "@/lib/api";
import { formatMoney, personName } from "@/lib/money";

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function GroupScreen() {
  const router = useRouter();
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
            <View style={styles.hero}>
              <View style={styles.heroMeta}>
                <Text style={styles.heading}>{group.name}</Text>
                <Balance amount={group.myBalance} />
              </View>
              <View style={styles.spend}>
                <Text style={styles.spendLabel}>Total group spend</Text>
                <Text style={styles.spendValue}>{formatMoney(totalSpend)}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.heading}>Group</Text>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {group ? (
            <Pressable style={styles.peopleRow} onPress={() => setPeopleOpen((open) => !open)}>
              <Text style={styles.peopleLabel}>
                {group.members.length} {group.members.length === 1 ? "person" : "people"} in this group
              </Text>
              <Text style={styles.chevron}>{peopleOpen ? "▾" : "▸"}</Text>
            </Pressable>
          ) : null}
          {peopleOpen && group ? (
            <View style={styles.roster}>
              {group.members.map((member, index) => {
                const named = member.name?.trim();
                const mark = (named || member.email).slice(0, 1).toUpperCase();
                return (
                  <View key={member.email} style={[styles.personCard, index === 0 && { borderTopWidth: 0 }]}>
                    <Avatar seed={member.email} label={mark} size={34} />
                    <View style={{ flex: 1 }}>
                      {named ? <Text style={styles.personName}>{named}</Text> : null}
                      <Text style={named ? styles.personEmail : styles.personEmailOnly}>{member.email}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
          <SectionLabel>Expenses</SectionLabel>
          {group && group.expenses.length === 0 ? (
            <Text style={styles.empty}>No expenses yet. Tap below to split the first bill.</Text>
          ) : null}
          {group?.expenses.map((expense) => (
            <Pressable
              key={expense.id}
              style={styles.card}
              onPress={() => router.push(`/add-expense?groupId=${group.id}&expenseId=${expense.id}`)}>
              <View style={styles.row}>
                <Text style={styles.expense}>{expense.description}</Text>
                <Text style={styles.amount}>{formatMoney(expense.amount)}</Text>
              </View>
              <Text style={styles.muted}>
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
    borderColor: "rgba(34,245,158,0.22)",
    overflow: "hidden",
    backgroundColor: Brand.card,
  },
  heroMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  heading: { color: Brand.ink, fontSize: 32, fontFamily: "serif", fontWeight: "500", letterSpacing: -0.5, flexShrink: 1 },
  spend: {
    backgroundColor: "rgba(8,10,18,0.52)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  spendLabel: { color: Brand.muted, fontSize: 12, fontWeight: "600" },
  spendValue: { color: Brand.ink, fontSize: 16, fontWeight: "800" },
  peopleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Brand.card,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Brand.line,
  },
  peopleLabel: { color: Brand.ink, fontWeight: "700", fontSize: 14.5 },
  chevron: { color: Brand.moss, fontSize: 14, fontWeight: "700" },
  roster: {
    backgroundColor: Brand.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Brand.line,
    overflow: "hidden",
  },
  personCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  personName: { color: Brand.ink, fontWeight: "700", fontSize: 14 },
  personEmail: { color: Brand.muted, marginTop: 1, fontSize: 12 },
  personEmailOnly: { color: Brand.ink, fontWeight: "600", fontSize: 14 },
  card: { backgroundColor: Brand.card, borderRadius: 20, padding: 15, borderWidth: 1, borderColor: Brand.line, gap: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  expense: { color: Brand.ink, fontWeight: "700", fontSize: 15.5, flex: 1 },
  amount: { color: Brand.ink, fontWeight: "800", fontSize: 15.5 },
  muted: { color: Brand.muted, marginTop: 4, marginBottom: 8, fontSize: 12.5 },
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
