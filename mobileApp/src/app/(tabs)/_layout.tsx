import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/ui";
import { AdsProvider } from "@/lib/ads-provider";
import { useAuth } from "@/lib/auth";
import { useAppTheme } from "@/lib/theme";

type DockProps = {
  state: { index: number; routes: ReadonlyArray<{ key: string; name: string }> };
  emitter: {
    emit: (event: { type: "tabPress"; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
  };
  navigateToTab: (routeKey: string) => void;
  bottomInset: number;
};

function ExpenseButton() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add expense"
      onPress={() => router.push("/add-expense")}
      style={({ pressed }) => [
        styles.expense,
        {
          backgroundColor: colors.moss,
          backgroundImage: colors.primaryGradient,
          shadowColor: colors.moss,
          shadowOpacity: isDark ? 0.38 : 0.28,
        },
        pressed && styles.pressed,
      ]}>
      {isDark ? <View pointerEvents="none" style={styles.fabSpecular} /> : null}
      <Ionicons name="add" size={20} color={colors.onAccent} />
      <Text style={[styles.expenseLabel, { color: colors.onAccent }]}>Expense</Text>
    </Pressable>
  );
}

function GlassDock({ state, emitter, navigateToTab, bottomInset }: DockProps) {
  const { colors, isDark } = useAppTheme();
  return (
    <View style={[styles.slot, { paddingBottom: Math.max(bottomInset, 12) }]} pointerEvents="box-none">
      <ExpenseButton />
      <View
        style={[
          styles.dock,
          {
            backgroundColor: colors.dockBg,
            borderColor: colors.dockBorder,
            shadowColor: colors.shadowColor,
            shadowOpacity: isDark ? 0.55 : 0.1,
          },
        ]}>
        {isDark ? <View pointerEvents="none" style={styles.dockSpecular} /> : null}
        {state.routes.map((route, index) => {
          const active = state.index === index;
          const friends = route.name === "friends";
          const color = active ? colors.moss : colors.muted;
          const iconName = friends
            ? active
              ? "person"
              : "person-outline"
            : active
              ? "people"
              : "people-outline";

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                const event = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!active && !event.defaultPrevented) navigateToTab(route.key);
              }}
              style={[
                styles.tab,
                active && {
                  backgroundColor: colors.mossSoft,
                  borderWidth: 1,
                  borderColor: colors.mossBorder,
                },
              ]}>
              <Ionicons name={iconName} size={18} color={color} />
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? colors.moss : colors.muted, fontWeight: active ? "700" : "600" },
                ]}>
                {friends ? "Friends" : "Groups"}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { user, ready } = useAuth();
  const { colors } = useAppTheme();

  if (!ready) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.moss} />
        </View>
      </Screen>
    );
  }
  if (!user) return <Redirect href="/login" />;

  return (
    <AdsProvider>
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
          sceneStyle: { backgroundColor: colors.sand },
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
    </AdsProvider>
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
    height: 64,
    padding: 6,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    overflow: "hidden",
  },
  dockSpecular: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  tab: {
    flex: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabLabel: { fontSize: 11.5 },
  pressed: { opacity: 0.86, transform: [{ scale: 0.98 }] },
  expense: {
    alignSelf: "flex-end",
    marginBottom: 10,
    height: 50,
    borderRadius: 999,
    paddingLeft: 14,
    paddingRight: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    overflow: "hidden",
  },
  fabSpecular: {
    position: "absolute",
    top: 0,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.45)",
  },
  expenseLabel: { fontSize: 14.5, fontWeight: "800" },
});
