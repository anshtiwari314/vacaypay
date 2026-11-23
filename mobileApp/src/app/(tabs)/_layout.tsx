import { Redirect, Tabs, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Brand, Screen } from "@/components/ui";
import { useAuth } from "@/lib/auth";

type DockProps = {
  state: { index: number; routes: ReadonlyArray<{ key: string; name: string }> };
  emitter: {
    emit: (event: { type: "tabPress"; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
  };
  navigateToTab: (routeKey: string) => void;
  bottomInset: number;
};

function GroupsIcon({ color }: { color: string }) {
  return (
    <View style={styles.groupsIcon}>
      <View style={styles.personBack}>
        <View style={[styles.head, { backgroundColor: color }]} />
        <View style={[styles.shoulders, { backgroundColor: color }]} />
      </View>
      <View style={styles.personFront}>
        <View style={[styles.headLg, { backgroundColor: color }]} />
        <View style={[styles.shouldersLg, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function FriendIcon({ color }: { color: string }) {
  return (
    <View style={styles.friendIcon}>
      <View style={[styles.headLg, { backgroundColor: color }]} />
      <View style={[styles.shouldersLg, { backgroundColor: color }]} />
    </View>
  );
}

function ExpenseButton() {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add expense"
      onPress={() => router.push("/add-expense")}
      style={({ pressed }) => [styles.expense, pressed && styles.pressed]}>
      <Text style={styles.expensePlus}>+</Text>
      <Text style={styles.expenseLabel}>Expense</Text>
    </Pressable>
  );
}

function GlassDock({ state, emitter, navigateToTab, bottomInset }: DockProps) {
  return (
    <View style={[styles.slot, { paddingBottom: Math.max(bottomInset, 12) }]} pointerEvents="box-none">
      <ExpenseButton />
      <View style={styles.dock}>
        {state.routes.map((route, index) => {
          const active = state.index === index;
          const friends = route.name === "friends";
          const color = active ? Brand.moss : Brand.muted;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                const event = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!active && !event.defaultPrevented) navigateToTab(route.key);
              }}
              style={[styles.tab, active && styles.tabOn]}>
              {friends ? <FriendIcon color={color} /> : <GroupsIcon color={color} />}
              <Text style={[styles.tabLabel, active && styles.tabLabelOn]}>{friends ? "Friends" : "Groups"}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={Brand.moss} />
        </View>
      </Screen>
    );
  }
  if (!user) return <Redirect href="/login" />;

  return (
    <Tabs
      tabBar={(props) => (
        <GlassDock
          state={props.state}
          emitter={props.emitter}
          navigateToTab={props.navigateToTab}
          bottomInset={props.insets.bottom}
        />
      )}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Brand.sand },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}>
      <Tabs.Screen name="groups" options={{ title: "Groups" }} />
      <Tabs.Screen name="friends" options={{ title: "Friends" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  slot: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  dock: {
    height: 62,
    padding: 6,
    borderRadius: 24,
    backgroundColor: "rgba(14, 17, 27, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
    flexDirection: "row",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  tab: {
    flex: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabOn: {
    backgroundColor: "rgba(34,245,158,0.13)",
    borderWidth: 1,
    borderColor: "rgba(34,245,158,0.24)",
  },
  tabLabel: { color: Brand.muted, fontSize: 11.5, fontWeight: "600" },
  tabLabelOn: { color: Brand.moss, fontWeight: "700" },
  pressed: { opacity: 0.86 },
  groupsIcon: { width: 22, height: 16 },
  personBack: { position: "absolute", left: 0, bottom: 0, alignItems: "center" },
  personFront: { position: "absolute", right: 0, bottom: 0, alignItems: "center" },
  friendIcon: { alignItems: "center", height: 16, justifyContent: "flex-end" },
  head: { width: 6, height: 6, borderRadius: 3 },
  shoulders: { width: 10, height: 5, borderTopLeftRadius: 5, borderTopRightRadius: 5, marginTop: 1 },
  headLg: { width: 7, height: 7, borderRadius: 4 },
  shouldersLg: { width: 12, height: 6, borderTopLeftRadius: 6, borderTopRightRadius: 6, marginTop: 1 },
  expense: {
    alignSelf: "flex-end",
    marginBottom: 10,
    height: 52,
    borderRadius: 999,
    backgroundColor: Brand.moss,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  expensePlus: { color: Brand.onAccent, fontSize: 20, fontWeight: "800", marginTop: -1 },
  expenseLabel: { color: Brand.onAccent, fontSize: 14, fontWeight: "800" },
});
