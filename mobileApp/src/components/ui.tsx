import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { balanceLabel, personName } from "@/lib/money";

export const Brand = {
  ink: "#F3F4F6",
  inkSoft: "#CBD5E1",
  moss: "#22F59E",
  mossDark: "#06B6D4",
  sand: "#08090F",
  card: "rgba(17, 20, 31, 0.78)",
  coral: "#8B5CF6",
  line: "rgba(255, 255, 255, 0.08)",
  muted: "#8E9BB0",
  good: "#22F59E",
  bad: "#FB7185",
  cream: "#0E111B",
  onAccent: "#05080B",
  cyan: "#06B6D4",
  violet: "#8B5CF6",
};

export const TabClearance = 108;

export const DisplayFont = "SpaceGrotesk_700Bold";

const avatarTones = [
  { bg: "rgba(34, 245, 158, 0.16)", fg: "#22F59E" },
  { bg: "rgba(6, 182, 212, 0.18)", fg: "#38BDF8" },
  { bg: "rgba(139, 92, 246, 0.2)", fg: "#C4B5FD" },
  { bg: "rgba(251, 113, 133, 0.18)", fg: "#FDA4AF" },
  { bg: "rgba(251, 191, 36, 0.16)", fg: "#FCD34D" },
];

function toneFor(seed: string) {
  let hash = 0;
  const value = seed || "a";
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 997;
  }
  return avatarTones[Math.abs(hash) % avatarTones.length];
}

export function Ambient() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, styles.washMint]} />
      <View style={[StyleSheet.absoluteFill, styles.washViolet]} />
      <View style={[StyleSheet.absoluteFill, styles.washCyan]} />
    </View>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return (
    <View style={styles.screen}>
      <Ambient />
      {children}
    </View>
  );
}

export function Wordmark({ size = 20 }: { size?: number }) {
  return (
    <Text style={[styles.wordmark, { fontSize: size }]}>
      Vacay<Text style={styles.wordmarkPay}>Pay</Text>
    </Text>
  );
}

export function Mark({ size = "sm" }: { size?: "sm" | "lg" }) {
  const large = size === "lg";
  return (
    <View style={[styles.mark, large ? styles.markLg : styles.markSm]}>
      <Text style={[styles.markText, large ? styles.markTextLg : styles.markTextSm]}>V</Text>
    </View>
  );
}

export function Button({
  label,
  onPress,
  busy,
  tone = "moss",
  disabled,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  tone?: "moss" | "coral" | "ghost";
  disabled?: boolean;
}) {
  const ghost = tone === "ghost";
  const content = busy ? (
    <ActivityIndicator color={ghost ? Brand.moss : Brand.onAccent} />
  ) : (
    <Text style={[styles.buttonText, ghost ? styles.buttonTextGhost : { color: Brand.onAccent }]}>{label}</Text>
  );

  if (ghost) {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled || busy}
        onPress={onPress}
        style={({ pressed }) => [styles.button, styles.ghost, (disabled || busy) && styles.disabled, pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [styles.buttonWrap, (disabled || busy) && styles.disabled, pressed && styles.pressed]}>
      <View style={styles.button}>{content}</View>
    </Pressable>
  );
}

export function Field({
  label,
  inputStyle,
  ...props
}: { label: string; inputStyle?: StyleProp<TextStyle> } & TextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput placeholderTextColor="#5B677D" autoCapitalize="none" style={[styles.input, inputStyle]} {...props} />
    </View>
  );
}

export function Notice({ text, tone = "warn" }: { text: string; tone?: "warn" | "bad" }) {
  return (
    <View style={[styles.notice, tone === "bad" && styles.noticeBad]}>
      <Text style={[styles.noticeText, tone === "bad" && styles.noticeTextBad]}>{text}</Text>
    </View>
  );
}

export function Glass({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.glass, style]}>{children}</View>;
}

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function TopBar({
  title,
  email,
  onSignOut,
}: {
  title: string;
  email?: string;
  onSignOut?: () => void;
}) {
  return (
    <View style={styles.top}>
      <View style={{ flex: 1 }}>
        <Wordmark size={18} />
        <Text style={styles.title}>{title}</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}
      </View>
      {onSignOut ? (
        <Pressable onPress={onSignOut} hitSlop={8} style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Balance({ amount }: { amount: number }) {
  const settled = Math.abs(amount) < 0.005;
  const good = !settled && amount > 0;
  return (
    <View style={[styles.badge, settled ? styles.badgeSettled : good ? styles.badgeGood : styles.badgeBad]}>
      <Text
        numberOfLines={1}
        style={[styles.badgeText, settled ? styles.badgeTextSettled : good ? styles.badgeTextGood : styles.badgeTextBad]}>
        {balanceLabel(amount)}
      </Text>
    </View>
  );
}

export function Avatar({
  seed,
  label,
  size = 40,
}: {
  seed: string;
  label: string;
  size?: number;
}) {
  const tone = toneFor(seed);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size >= 40 ? 13 : 11,
        backgroundColor: tone.bg,
        alignItems: "center",
        justifyContent: "center",
      }}>
      <Text style={{ color: tone.fg, fontWeight: "800", fontSize: size >= 40 ? 15 : 13 }}>{label}</Text>
    </View>
  );
}

export function AvatarStack({ people }: { people: { email: string; name: string | null }[] }) {
  const visible = people.slice(0, 4);
  const extra = people.length - visible.length;
  return (
    <View style={styles.stack}>
      {visible.map((person, index) => {
        const tone = toneFor(person.email);
        return (
          <View
            key={person.email}
            style={[
              styles.mini,
              { backgroundColor: tone.bg, marginLeft: index === 0 ? 0 : -7, zIndex: 10 - index },
            ]}>
            <Text style={[styles.miniText, { color: tone.fg }]}>{personName(person).slice(0, 1).toUpperCase()}</Text>
          </View>
        );
      })}
      {extra > 0 ? (
        <View style={[styles.mini, styles.miniMore, { marginLeft: -7 }]}>
          <Text style={styles.miniMoreText}>+{extra}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function NetCard({ owedToYou, youOwe }: { owedToYou: number; youOwe: number }) {
  const net = owedToYou - youOwe;
  const settled = Math.abs(net) < 0.005;
  const good = !settled && net > 0;
  const sign = settled ? "" : good ? "+" : "−";
  const status = settled ? "All settled" : good ? "In the green" : "You owe overall";
  const money = `₹${Math.abs(net).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const owed = `₹${Math.abs(owedToYou).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const owe = `₹${Math.abs(youOwe).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <View style={styles.net}>
      <View style={styles.netTop}>
        <Text style={styles.netLabel}>Overall net balance</Text>
        <View style={[styles.netPill, good && styles.badgeGood, !settled && !good && styles.badgeBad]}>
          <Text style={[styles.netPillText, good && styles.badgeTextGood, !settled && !good && styles.badgeTextBad]}>{status}</Text>
        </View>
      </View>
      <Text style={[styles.netValue, good && styles.badgeTextGood, !settled && !good && styles.badgeTextBad]}>
        {sign}
        {money}
      </Text>
      <View style={styles.netSplit}>
        <View style={styles.netMini}>
          <Text style={styles.netMiniLabel}>Owed to you</Text>
          <Text style={[styles.netMiniValue, styles.badgeTextGood]}>+{owed}</Text>
        </View>
        <View style={styles.netMini}>
          <Text style={styles.netMiniLabel}>You owe</Text>
          <Text style={[styles.netMiniValue, styles.badgeTextBad]}>−{owe}</Text>
        </View>
      </View>
    </View>
  );
}

export function Chip({ label, on, onPress }: { label: string; on?: boolean; onPress: () => void }) {
  if (on) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        <View style={styles.chipOn}>
          <Text style={styles.chipOnText}>{label}</Text>
        </View>
      </Pressable>
    );
  }
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

export function AddExpenseButton({
  bottom = 24,
  href = "/add-expense",
}: {
  bottom?: number;
  href?: "/add-expense" | `/add-expense?${string}`;
}) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add expense"
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.fabWrap, { bottom }, pressed && styles.pressed]}>
      <View style={styles.fab}>
        <Text style={styles.fabPlus}>+</Text>
        <Text style={styles.fabLabel}>Expense</Text>
      </View>
    </Pressable>
  );
}

export function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
      <Text style={styles.backText}>‹ {label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.sand },
  washMint: { backgroundImage: "linear-gradient(145deg, rgba(34,245,158,0.16) 0%, rgba(8,9,15,0) 52%)" },
  washViolet: { backgroundImage: "linear-gradient(210deg, rgba(139,92,246,0.18) 0%, rgba(8,9,15,0) 48%)" },
  washCyan: { backgroundImage: "linear-gradient(20deg, rgba(6,182,212,0.12) 0%, rgba(8,9,15,0) 42%)" },
  wordmark: { color: Brand.ink, fontFamily: DisplayFont, fontWeight: "700", letterSpacing: -0.6 },
  wordmarkPay: { color: Brand.moss },
  mark: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E111B",
    borderWidth: 1.5,
    borderColor: Brand.moss,
  },
  markLg: {
    width: 88,
    height: 88,
    borderRadius: 28,
    marginBottom: 22,
    shadowColor: Brand.moss,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  markSm: {
    width: 52,
    height: 52,
    borderRadius: 16,
    shadowColor: Brand.moss,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  markText: { color: Brand.moss, fontFamily: DisplayFont, fontWeight: "700" },
  markTextLg: { fontSize: 48 },
  markTextSm: { fontSize: 28 },
  buttonWrap: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Brand.moss,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  button: {
    width: "100%",
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: Brand.moss,
  },
  ghost: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: Brand.line,
  },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.86 },
  buttonText: { fontSize: 15, fontWeight: "700" },
  buttonTextGhost: { color: Brand.ink },
  field: { gap: 7 },
  fieldLabel: {
    color: Brand.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "rgba(10, 12, 20, 0.85)",
    borderWidth: 1,
    borderColor: Brand.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: "500",
    color: Brand.ink,
  },
  notice: {
    backgroundColor: "rgba(34, 245, 158, 0.1)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(34, 245, 158, 0.3)",
  },
  noticeBad: { backgroundColor: "rgba(251, 113, 133, 0.11)", borderColor: "rgba(251, 113, 133, 0.35)" },
  noticeText: { color: "#D1FAE5", lineHeight: 20, fontSize: 13.5, fontWeight: "500" },
  noticeTextBad: { color: "#FECDD3" },
  glass: {
    backgroundColor: Brand.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: 16,
    gap: 13,
  },
  section: {
    color: Brand.muted,
    fontWeight: "700",
    fontSize: 11.5,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginTop: 4,
  },
  top: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 4 },
  title: {
    color: Brand.ink,
    fontFamily: "serif",
    fontSize: 34,
    fontWeight: "500",
    letterSpacing: -0.6,
    marginTop: 2,
  },
  email: { color: Brand.muted, marginTop: 4, fontSize: 13, fontWeight: "500" },
  signOut: {
    marginTop: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: Brand.line,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  signOutText: { color: Brand.inkSoft, fontWeight: "600", fontSize: 12.5 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    maxWidth: "100%",
  },
  badgeGood: { backgroundColor: "rgba(34,245,158,0.13)", borderColor: "rgba(34,245,158,0.28)" },
  badgeBad: { backgroundColor: "rgba(251,113,133,0.13)", borderColor: "rgba(251,113,133,0.28)" },
  badgeSettled: { backgroundColor: "rgba(148,163,184,0.1)", borderColor: "rgba(148,163,184,0.2)" },
  badgeText: { fontWeight: "700", fontSize: 12 },
  badgeTextGood: { color: Brand.good },
  badgeTextBad: { color: Brand.bad },
  badgeTextSettled: { color: Brand.muted },
  stack: { flexDirection: "row", alignItems: "center" },
  mini: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#11141F",
    alignItems: "center",
    justifyContent: "center",
  },
  miniText: { fontSize: 11, fontWeight: "800" },
  miniMore: { backgroundColor: "rgba(255,255,255,0.1)" },
  miniMoreText: { color: Brand.inkSoft, fontSize: 10, fontWeight: "800" },
  net: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(34,245,158,0.24)",
    overflow: "hidden",
    backgroundColor: Brand.card,
  },
  netTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  netLabel: {
    color: Brand.inkSoft,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    flex: 1,
  },
  netPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  netPillText: { color: Brand.inkSoft, fontSize: 11, fontWeight: "700" },
  netValue: {
    color: Brand.ink,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginTop: 8,
    marginBottom: 14,
  },
  netSplit: { flexDirection: "row", gap: 10 },
  netMini: {
    flex: 1,
    backgroundColor: "rgba(8,10,18,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  netMiniLabel: { color: Brand.muted, fontSize: 11, fontWeight: "600" },
  netMiniValue: { marginTop: 3, fontSize: 15, fontWeight: "700" },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Brand.line,
    backgroundColor: Brand.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipOn: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Brand.moss },
  chipText: { color: Brand.inkSoft, fontWeight: "600", fontSize: 13.5 },
  chipOnText: { color: Brand.onAccent, fontWeight: "700", fontSize: 13.5 },
  fabWrap: {
    position: "absolute",
    right: 18,
    bottom: TabClearance,
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: Brand.moss,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  fab: {
    borderRadius: 999,
    paddingVertical: 13,
    paddingLeft: 15,
    paddingRight: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: Brand.moss,
  },
  fabPlus: { color: Brand.onAccent, fontSize: 20, fontWeight: "800", marginTop: -1 },
  fabLabel: { color: Brand.onAccent, fontSize: 14.5, fontWeight: "800" },
  back: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: Brand.line,
    borderRadius: 999,
    paddingVertical: 7,
    paddingRight: 14,
    paddingLeft: 11,
  },
  backText: { color: Brand.moss, fontSize: 13.5, fontWeight: "700" },
});
