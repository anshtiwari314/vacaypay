import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton, Button, Chip, DisplayFont, Field, Glass, Notice, Screen, SectionLabel } from "@/components/ui";
import { api, ApiError, type Friend, type GroupSummary } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatMoney, personName } from "@/lib/money";
import { useAppTheme } from "@/lib/theme";

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function Bone({ width, height }: { width: number | `${number}%`; height: number }) {
  const { colors } = useAppTheme();
  const opacity = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[styles.bone, { backgroundColor: colors.bone, width, height, opacity }]} />;
}

function EditSkeleton() {
  return (
    <View style={{ gap: 14 }}>
      <Bone width={180} height={34} />
      <Bone width="70%" height={16} />
      <Bone width="100%" height={52} />
      <Bone width="100%" height={52} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Bone width={72} height={36} />
        <Bone width={110} height={36} />
        <Bone width={96} height={36} />
      </View>
      <Bone width="100%" height={64} />
      <Bone width="100%" height={64} />
      <Bone width="100%" height={52} />
    </View>
  );
}

export default function AddExpenseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ groupId?: string; expenseId?: string }>();
  const presetGroup = param(params.groupId) ?? "";
  const expenseId = param(params.expenseId) ?? "";
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groupId, setGroupId] = useState(presetGroup);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [paidBy, setPaidBy] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(!expenseId);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setPaidBy((current) => current || user.email);
    Promise.all([api.groups(), api.friends(), expenseId ? api.expense(expenseId) : Promise.resolve(null)])
      .then(([groupResult, friendResult, expenseResult]) => {
        if (!active) return;
        setGroups(groupResult.groups);
        setFriends(friendResult.friends);
        const expense = expenseResult?.expense;
        if (expense) {
          setDescription(expense.description);
          setAmount(String(expense.amount));
          setGroupId(expense.groupId ?? "");
          setPaidBy(expense.paidByEmail);
          setSelected(expense.shares.map((share) => share.email).filter((email) => email !== user.email));
          return;
        }
        const initial = groupResult.groups.find((group) => group.id === presetGroup) ?? groupResult.groups[0];
        if (initial && !presetGroup) setGroupId(initial.id);
        if (initial) {
          setSelected(initial.members.map((member) => member.email).filter((email) => email !== user.email));
        }
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load people");
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [presetGroup, expenseId, user]);

  const group = groups.find((item) => item.id === groupId) ?? null;
  const people = group
    ? group.members.filter((member) => member.email !== user?.email)
    : friends.map((friend) => ({ email: friend.email, name: friend.name }));
  const payers = group
    ? group.members
    : [
        ...(user ? [{ email: user.email, name: user.name }] : []),
        ...friends.map((friend) => ({ email: friend.email, name: friend.name })),
      ];
  const value = Number(amount);
  const splitCount = selected.length + 1;
  const each = Number.isFinite(value) && value > 0 && splitCount > 0 ? value / splitCount : 0;

  function chooseGroup(id: string) {
    setGroupId(id);
    const next = groups.find((item) => item.id === id);
    setSelected(next ? next.members.map((member) => member.email).filter((email) => email !== user?.email) : []);
  }

  function toggle(email: string) {
    setSelected((current) => (current.includes(email) ? current.filter((item) => item !== email) : [...current, email]));
  }

  async function save() {
    setBusy(true);
    setError("");
    try {
      const body = {
        description,
        amount: value,
        emails: selected,
        paidBy: paidBy || user?.email,
      };
      if (expenseId) await api.updateExpense(expenseId, body);
      else await api.addExpense({ ...body, groupId: group ? group.id : null });
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the expense");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <BackButton />
            {expenseId && !ready ? (
              <EditSkeleton />
            ) : (
              <>
                <Text style={[styles.heading, { color: colors.ink }]}>{expenseId ? "Edit expense" : "Add expense"}</Text>
                <Text style={[styles.sub, { color: colors.muted }]}>Split equally with the people you select.</Text>
                <View style={[styles.amountBox, { backgroundColor: colors.mossSoft, borderColor: colors.mossBorder }]}>
                  <Text style={[styles.amountLabel, { color: colors.moss }]}>Amount</Text>
                  <View style={styles.amountRow}>
                    <Text style={[styles.currency, { color: colors.moss }]}>₹</Text>
                    <TextInput
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="0.00"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="decimal-pad"
                      style={[styles.amountInput, { color: colors.ink }]}
                    />
                  </View>
                </View>
                <Glass>
                  <Field label="What was it" value={description} onChangeText={setDescription} placeholder="Dinner, scooters, stay..." autoCapitalize="sentences" />
                  <SectionLabel>Who paid</SectionLabel>
                  <View style={styles.choices}>
                    {payers.map((person) => {
                      const on = (paidBy || user?.email) === person.email;
                      const label = person.email === user?.email ? "You" : personName(person);
                      return <Chip key={person.email} label={label} on={on} onPress={() => setPaidBy(person.email)} />;
                    })}
                  </View>
                  <SectionLabel>{presetGroup ? "Group" : "Split in"}</SectionLabel>
                  <View style={styles.choices}>
                    {!presetGroup ? (
                      <Chip
                        label="A friend"
                        on={!group}
                        onPress={() => {
                          setGroupId("");
                          setSelected([]);
                        }}
                      />
                    ) : null}
                    {groups.map((item) => (
                      <Chip key={item.id} label={item.name} on={group?.id === item.id} onPress={() => chooseGroup(item.id)} />
                    ))}
                  </View>
                </Glass>

                <SectionLabel>{group ? "People in the split" : "Friend"}</SectionLabel>
                {people.length === 0 ? (
                  <Text style={[styles.empty, { color: colors.muted, borderColor: colors.lineStrong }]}>
                    {group ? "This group is just you so far." : "Add a friend first, or create a group."}
                  </Text>
                ) : (
                  people.map((person) => {
                    const on = selected.includes(person.email);
                    return (
                      <Pressable
                        key={person.email}
                        style={[
                          styles.person,
                          { backgroundColor: colors.card, borderColor: colors.line },
                          on && { borderColor: colors.mossBorder, backgroundColor: colors.mossSoft },
                        ]}
                        onPress={() => toggle(person.email)}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.personName, { color: colors.ink }]}>{personName(person)}</Text>
                          <Text style={[styles.personEmail, { color: on ? colors.moss : colors.muted }, on && styles.personEmailOn]}>
                            {on ? "In the split" : person.email}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.check,
                            { borderColor: colors.lineStrong },
                            on && { backgroundColor: colors.moss, borderColor: colors.moss },
                          ]}>
                          <Text style={[styles.checkMark, on && { color: colors.onAccent }]}>✓</Text>
                        </View>
                      </Pressable>
                    );
                  })
                )}
                {each > 0 ? (
                  <Text
                    style={[
                      styles.each,
                      {
                        color: colors.moss,
                        backgroundColor: colors.mossSoft,
                        borderColor: colors.mossBorder,
                      },
                    ]}>
                    {formatMoney(each)} each, including you
                  </Text>
                ) : null}
                {error ? <Notice text={error} tone="bad" /> : null}
                <Button label={expenseId ? "Save changes" : "Save expense"} onPress={save} busy={busy} />
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  body: { padding: 18, gap: 12, paddingBottom: 48 },
  heading: { fontSize: 30, fontFamily: DisplayFont, fontWeight: "700", letterSpacing: -0.7 },
  sub: { lineHeight: 21, fontSize: 14.5, marginTop: -4 },
  amountBox: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  amountLabel: { fontSize: 11.5, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  amountRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  currency: { fontSize: 30, fontWeight: "700" },
  amountInput: {
    flex: 1,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
    paddingVertical: 0,
  },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  person: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  personName: { fontWeight: "700", fontSize: 14.5 },
  personEmail: { marginTop: 2, fontSize: 12.5 },
  personEmailOn: { fontWeight: "600" },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: { color: "transparent", fontSize: 13, fontWeight: "800" },
  each: {
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 15,
    overflow: "hidden",
  },
  empty: {
    lineHeight: 21,
    textAlign: "center",
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 18,
  },
  bone: { borderRadius: 14 },
});
