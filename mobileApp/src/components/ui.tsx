import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
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
import { lightPalette, toneForSeed, useAppTheme, type ThemePalette } from "@/lib/theme";

export const Brand = lightPalette;

export const TabClearance = 108;

export const DisplayFont = "SpaceGrotesk_700Bold";

export function Ambient() {
  const { isDark } = useAppTheme();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {isDark ? (
        <>
          <View style={[styles.orb, styles.orbMint]} />
          <View style={[styles.orb, styles.orbViolet]} />
          <View style={[styles.orb, styles.orbCyan]} />
        </>
      ) : null}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundImage: isDark
              ? "linear-gradient(145deg, rgba(34,245,158,0.13) 0%, rgba(6,8,14,0) 48%)"
              : "linear-gradient(145deg, rgba(16,185,129,0.09) 0%, rgba(255,255,255,0) 48%)",
          },
        ]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundImage: isDark
              ? "linear-gradient(215deg, rgba(139,92,246,0.17) 0%, rgba(6,8,14,0) 50%)"
              : "linear-gradient(210deg, rgba(14,165,233,0.07) 0%, rgba(255,255,255,0) 45%)",
          },
        ]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundImage: isDark
              ? "linear-gradient(20deg, rgba(6,182,212,0.12) 0%, rgba(6,8,14,0) 44%)"
              : "linear-gradient(20deg, rgba(124,58,237,0.04) 0%, rgba(255,255,255,0) 40%)",
          },
        ]}
      />
    </View>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.screen, { backgroundColor: colors.sand }]}>
      <Ambient />
      {children}
    </View>
  );
}

export function Wordmark({ size = 20 }: { size?: number }) {
  const { colors } = useAppTheme();
  return (
    <Text style={[styles.wordmark, { fontSize: size, color: colors.ink }]}>
      Vacay<Text style={{ color: colors.moss }}>Pay</Text>
    </Text>
  );
}

export function Mark({ size = "sm" }: { size?: "sm" | "lg" }) {
  const { colors, isDark } = useAppTheme();
  const large = size === "lg";
  return (
    <View
      style={[
        styles.mark,
        large ? styles.markLg : styles.markSm,
        isDark
          ? {
              backgroundColor: colors.moss,
              backgroundImage: colors.primaryGradient,
              borderColor: "rgba(255, 255, 255, 0.28)",
              shadowColor: colors.moss,
              shadowOpacity: 0.42,
            }
          : {
              backgroundColor: colors.markBg,
              borderColor: colors.mossBorder,
              shadowColor: colors.moss,
              shadowOpacity: 0.16,
            },
      ]}>
      <Text
        style={[
          styles.markText,
          large ? styles.markTextLg : styles.markTextSm,
          { color: isDark ? colors.onAccent : colors.moss },
        ]}>
        V
      </Text>
    </View>
  );
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { isDark, colors, toggleTheme } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isDark ? "Switch to white theme" : "Switch to dark theme"}
      onPress={toggleTheme}
      hitSlop={6}
      style={({ pressed }) => [
        styles.themeToggle,
        compact && styles.themeToggleCompact,
        {
          backgroundColor: colors.ghostBg,
          borderColor: isDark ? colors.mossBorder : colors.lineStrong,
        },
        pressed && styles.pressed,
      ]}>
      <Ionicons
        name={isDark ? "sunny" : "moon-outline"}
        size={14}
        color={isDark ? colors.moss : colors.inkSoft}
      />
      {!compact ? (
        <Text style={[styles.themeToggleText, { color: isDark ? colors.ink : colors.inkSoft }]}>
          {isDark ? "White" : "Dark"}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  busy,
  tone = "moss",
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  tone?: "moss" | "coral" | "ghost";
  disabled?: boolean;
  icon?: ReactNode;
}) {
  const { colors, isDark } = useAppTheme();
  const ghost = tone === "ghost";
  const accentColor = tone === "coral" ? colors.coral : colors.moss;

  const content = busy ? (
    <ActivityIndicator color={ghost ? colors.moss : colors.onAccent} />
  ) : (
    <View style={styles.buttonInner}>
      {icon ? <View style={styles.buttonIcon}>{icon}</View> : null}
      <Text
        style={[
          styles.buttonText,
          ghost ? { color: colors.ink } : { color: colors.onAccent },
        ]}>
        {label}
      </Text>
    </View>
  );

  if (ghost) {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled || busy}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.ghostBg,
            borderWidth: 1,
            borderColor: colors.lineStrong,
          },
          (disabled || busy) && styles.disabled,
          pressed && styles.pressed,
        ]}>
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonWrap,
        {
          shadowColor: accentColor,
          shadowOpacity: isDark ? 0.34 : 0.22,
        },
        (disabled || busy) && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <View
        style={[
          styles.button,
          {
            backgroundColor: accentColor,
            backgroundImage: tone === "coral" ? undefined : colors.primaryGradient,
          },
        ]}>
        {isDark ? <View pointerEvents="none" style={styles.buttonSpecular} /> : null}
        {content}
      </View>
    </Pressable>
  );
}

export function Field({
  label,
  inputStyle,
  leftIcon,
  onFocus,
  onBlur,
  ...props
}: {
  label: string;
  inputStyle?: StyleProp<TextStyle>;
  leftIcon?: ComponentProps<typeof Ionicons>["name"];
} & TextInputProps) {
  const { colors, isDark } = useAppTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: focused ? colors.moss : colors.muted }]}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.inputBg,
            borderColor: focused ? colors.moss : colors.lineStrong,
            shadowColor: focused ? colors.moss : "transparent",
            shadowOpacity: focused && isDark ? 0.22 : 0,
            shadowRadius: focused && isDark ? 10 : 0,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}>
        {leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={18}
            color={focused ? colors.moss : colors.muted}
            style={styles.inputIcon}
          />
        ) : null}
        <TextInput
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          style={[styles.input, { color: colors.ink }, inputStyle]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
      </View>
    </View>
  );
}

export function Notice({ text, tone = "warn" }: { text: string; tone?: "warn" | "bad" }) {
  const { colors } = useAppTheme();
  const isBad = tone === "bad";
  return (
    <View
      style={[
        styles.notice,
        {
          backgroundColor: isBad ? colors.badBg : colors.goodBg,
          borderColor: isBad ? colors.badBorder : colors.goodBorder,
        },
      ]}>
      <Ionicons
        name={isBad ? "alert-circle-outline" : "information-circle-outline"}
        size={17}
        color={isBad ? colors.bad : colors.good}
        style={{ marginTop: 1 }}
      />
      <Text
        style={[
          styles.noticeText,
          { color: isBad ? colors.noticeBadText : colors.noticeText },
        ]}>
        {text}
      </Text>
    </View>
  );
}

export function Glass({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors, isDark } = useAppTheme();
  return (
    <View
      style={[
        styles.glass,
        {
          backgroundColor: colors.card,
          borderColor: isDark ? colors.lineStrong : colors.line,
          shadowColor: colors.shadowColor,
          shadowOpacity: isDark ? 0.36 : colors.shadowOpacity,
          shadowRadius: isDark ? 20 : 18,
          shadowOffset: { width: 0, height: isDark ? 12 : 8 },
          elevation: isDark ? 5 : 2,
        },
        style,
      ]}>
      {isDark ? (
        <View pointerEvents="none" style={[styles.specularEdge, { backgroundColor: colors.cardSpecular }]} />
      ) : null}
      {children}
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  const { colors } = useAppTheme();
  return <Text style={[styles.section, { color: colors.muted }]}>{children}</Text>;
}

export function TopBar({
  title,
  email,
  badge,
  onSignOut,
}: {
  title: string;
  email?: string;
  badge?: string;
  onSignOut?: () => void;
}) {
  const { colors, isDark } = useAppTheme();
  return (
    <View style={styles.topWrap}>
      <View style={styles.topUtility}>
        <View style={styles.topBrand}>
          <View
            style={[
              styles.topMarkMini,
              isDark
                ? {
                    backgroundColor: colors.moss,
                    backgroundImage: colors.primaryGradient,
                    borderColor: "rgba(255,255,255,0.28)",
                  }
                : {
                    backgroundColor: colors.markBg,
                    borderColor: colors.mossBorder,
                  },
            ]}>
            <Text style={[styles.topMarkMiniText, { color: isDark ? colors.onAccent : colors.moss }]}>V</Text>
          </View>
          <Wordmark size={18} />
        </View>
        <View style={styles.topActions}>
          <ThemeToggle />
          {onSignOut ? (
            <Pressable
              onPress={onSignOut}
              hitSlop={8}
              style={({ pressed }) => [
                styles.signOut,
                { backgroundColor: colors.ghostBg, borderColor: colors.lineStrong },
                pressed && styles.pressed,
              ]}>
              <Ionicons name="log-out-outline" size={14} color={colors.inkSoft} />
              <Text style={[styles.signOutText, { color: colors.inkSoft }]}>Sign out</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.topTitleRow}>
        <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
        {badge ? (
          <View style={[styles.topBadge, { backgroundColor: colors.mossSoft, borderColor: colors.mossBorder }]}>
            <Text style={[styles.topBadgeText, { color: colors.moss }]}>{badge}</Text>
          </View>
        ) : null}
      </View>

      {email ? (
        <View style={styles.emailRow}>
          <Ionicons name="person-circle-outline" size={14} color={colors.muted} />
          <Text numberOfLines={1} style={[styles.email, { color: colors.muted }]}>
            {email}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function Balance({ amount }: { amount: number }) {
  const { colors } = useAppTheme();
  const settled = Math.abs(amount) < 0.005;
  const good = !settled && amount > 0;
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: settled ? colors.settledBg : good ? colors.goodBg : colors.badBg,
          borderColor: settled ? colors.settledBorder : good ? colors.goodBorder : colors.badBorder,
        },
      ]}>
      <Text
        numberOfLines={1}
        style={[
          styles.badgeText,
          { color: settled ? colors.muted : good ? colors.good : colors.bad },
        ]}>
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
  const { colors } = useAppTheme();
  const tone = toneForSeed(seed, colors);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size >= 40 ? 14 : 11,
        backgroundColor: tone.bg,
        borderWidth: 1,
        borderColor: tone.border,
        alignItems: "center",
        justifyContent: "center",
      }}>
      <Text style={{ color: tone.fg, fontWeight: "800", fontSize: size >= 40 ? 15 : 13 }}>{label}</Text>
    </View>
  );
}

export function AvatarStack({ people }: { people: { email: string; name: string | null }[] }) {
  const { colors } = useAppTheme();
  const visible = people.slice(0, 4);
  const extra = people.length - visible.length;
  return (
    <View style={styles.stack}>
      {visible.map((person, index) => {
        const tone = toneForSeed(person.email, colors);
        return (
          <View
            key={person.email}
            style={[
              styles.mini,
              {
                backgroundColor: tone.bg,
                borderColor: colors.avatarRing,
                marginLeft: index === 0 ? 0 : -8,
                zIndex: 10 - index,
              },
            ]}>
            <Text style={[styles.miniText, { color: tone.fg }]}>{personName(person).slice(0, 1).toUpperCase()}</Text>
          </View>
        );
      })}
      {extra > 0 ? (
        <View
          style={[
            styles.mini,
            {
              backgroundColor: colors.cream,
              borderColor: colors.avatarRing,
              marginLeft: -8,
            },
          ]}>
          <Text style={[styles.miniMoreText, { color: colors.inkSoft }]}>+{extra}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function NetCard({ owedToYou, youOwe }: { owedToYou: number; youOwe: number }) {
  const { colors, isDark } = useAppTheme();
  const net = owedToYou - youOwe;
  const settled = Math.abs(net) < 0.005;
  const good = !settled && net > 0;
  const sign = settled ? "" : good ? "+" : "−";
  const status = settled ? "All settled" : good ? "In the green" : "You owe overall";
  const money = `₹${Math.abs(net).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const owed = `₹${Math.abs(owedToYou).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const owe = `₹${Math.abs(youOwe).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalFlow = owedToYou + youOwe;
  const owedRatio = totalFlow > 0 ? Math.max(0.08, Math.min(0.92, owedToYou / totalFlow)) : 0.5;

  const pillBg = settled ? colors.settledBg : good ? colors.goodBg : colors.badBg;
  const pillBorder = settled ? colors.settledBorder : good ? colors.goodBorder : colors.badBorder;
  const pillText = settled ? colors.inkSoft : good ? colors.good : colors.bad;

  return (
    <View
      style={[
        styles.net,
        {
          backgroundColor: colors.card,
          borderColor: good ? colors.goodBorder : !settled ? colors.badBorder : colors.lineStrong,
          shadowColor: isDark ? (good ? colors.moss : "#000000") : colors.shadowColor,
          shadowOpacity: isDark ? (good ? 0.16 : 0.42) : 0.07,
          shadowRadius: isDark ? 22 : 20,
          shadowOffset: { width: 0, height: 12 },
          elevation: isDark ? 6 : 3,
        },
      ]}>
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundImage: colors.heroGradient,
          },
        ]}
      />
      {isDark ? (
        <View pointerEvents="none" style={[styles.specularEdge, { backgroundColor: "rgba(255,255,255,0.2)" }]} />
      ) : null}

      <View style={styles.netTop}>
        <Text style={[styles.netLabel, { color: isDark ? colors.inkSoft : colors.muted }]}>
          Overall net balance
        </Text>
        <View style={[styles.netPill, { backgroundColor: pillBg, borderColor: pillBorder }]}>
          <View style={[styles.netDot, { backgroundColor: pillText }]} />
          <Text style={[styles.netPillText, { color: pillText }]}>{status}</Text>
        </View>
      </View>

      <Text style={[styles.netValue, { color: settled ? colors.ink : good ? colors.good : colors.bad }]}>
        {sign}
        {money}
      </Text>

      {totalFlow > 0.01 ? (
        <View style={[styles.ratioTrack, { backgroundColor: colors.line }]}>
          {owedToYou > 0.005 ? (
            <View style={[styles.ratioFill, { flex: owedRatio, backgroundColor: colors.good }]} />
          ) : null}
          {youOwe > 0.005 ? (
            <View style={[styles.ratioFill, { flex: 1 - owedRatio, backgroundColor: colors.bad }]} />
          ) : null}
        </View>
      ) : null}

      <View style={styles.netSplit}>
        <View style={[styles.netMini, { backgroundColor: colors.cardSubtle, borderColor: colors.line }]}>
          <View style={styles.netMiniHead}>
            <View style={[styles.netMiniIcon, { backgroundColor: colors.goodBg }]}>
              <Ionicons name="arrow-down" size={11} color={colors.good} />
            </View>
            <Text style={[styles.netMiniLabel, { color: colors.muted }]}>Owed to you</Text>
          </View>
          <Text style={[styles.netMiniValue, { color: colors.good }]}>+{owed}</Text>
        </View>
        <View style={[styles.netMini, { backgroundColor: colors.cardSubtle, borderColor: colors.line }]}>
          <View style={styles.netMiniHead}>
            <View style={[styles.netMiniIcon, { backgroundColor: colors.badBg }]}>
              <Ionicons name="arrow-up" size={11} color={colors.bad} />
            </View>
            <Text style={[styles.netMiniLabel, { color: colors.muted }]}>You owe</Text>
          </View>
          <Text style={[styles.netMiniValue, { color: colors.bad }]}>−{owe}</Text>
        </View>
      </View>
    </View>
  );
}

export function Chip({ label, on, onPress }: { label: string; on?: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  if (on) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        <View style={[styles.chipOn, { backgroundColor: colors.moss }]}>
          <Text style={[styles.chipOnText, { color: colors.onAccent }]}>{label}</Text>
        </View>
      </Pressable>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { borderColor: colors.lineStrong, backgroundColor: colors.card },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.chipText, { color: colors.inkSoft }]}>{label}</Text>
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
  const { colors, isDark } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add expense"
      onPress={() => router.push(href)}
      style={({ pressed }) => [
        styles.fabWrap,
        {
          bottom,
          shadowColor: colors.moss,
          shadowOpacity: isDark ? 0.42 : 0.28,
        },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.fab, { backgroundColor: colors.moss, backgroundImage: colors.primaryGradient }]}>
        <Ionicons name="add" size={20} color={colors.onAccent} />
        <Text style={[styles.fabLabel, { color: colors.onAccent }]}>Expense</Text>
      </View>
    </Pressable>
  );
}

export function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={8}
      style={({ pressed }) => [
        styles.back,
        { backgroundColor: colors.ghostBg, borderColor: colors.lineStrong },
        pressed && styles.pressed,
      ]}>
      <Ionicons name="chevron-back" size={16} color={colors.moss} />
      <Text style={[styles.backText, { color: colors.moss }]}>{label}</Text>
    </Pressable>
  );
}

export function useThemedStyles<T>(factory: (colors: ThemePalette) => T): T {
  const { colors } = useAppTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  orbMint: {
    width: 280,
    height: 280,
    top: -90,
    left: -70,
    backgroundColor: "rgba(34, 245, 158, 0.08)",
  },
  orbViolet: {
    width: 260,
    height: 260,
    top: 160,
    right: -110,
    backgroundColor: "rgba(139, 92, 246, 0.10)",
  },
  orbCyan: {
    width: 240,
    height: 240,
    bottom: -80,
    left: 20,
    backgroundColor: "rgba(6, 182, 212, 0.07)",
  },
  wordmark: { fontFamily: DisplayFont, fontWeight: "700", letterSpacing: -0.6 },
  mark: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  markLg: {
    width: 84,
    height: 84,
    borderRadius: 26,
    marginBottom: 20,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  markSm: {
    width: 44,
    height: 44,
    borderRadius: 14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  markText: { fontFamily: DisplayFont, fontWeight: "700" },
  markTextLg: { fontSize: 44 },
  markTextSm: { fontSize: 23 },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  themeToggleCompact: {
    paddingHorizontal: 9,
  },
  themeToggleText: { fontSize: 12, fontWeight: "600" },
  buttonWrap: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  button: {
    width: "100%",
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
    overflow: "hidden",
  },
  buttonSpecular: {
    position: "absolute",
    top: 0,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.45)",
  },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  buttonInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  buttonIcon: { alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 15.5, fontWeight: "700", letterSpacing: -0.1 },
  field: { gap: 7 },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: "500",
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  noticeText: { flex: 1, lineHeight: 20, fontSize: 13.5, fontWeight: "500" },
  glass: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    overflow: "hidden",
  },
  specularEdge: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    height: 1,
  },
  section: {
    fontWeight: "700",
    fontSize: 11.5,
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  topWrap: { marginBottom: 4, gap: 6 },
  topUtility: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  topBrand: { flexDirection: "row", alignItems: "center", gap: 8 },
  topMarkMini: {
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topMarkMiniText: { fontFamily: DisplayFont, fontSize: 15, fontWeight: "700" },
  topActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  topTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 4,
  },
  title: {
    fontFamily: DisplayFont,
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.9,
  },
  topBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  topBadgeText: { fontSize: 11.5, fontWeight: "700" },
  emailRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  email: { fontSize: 12.5, fontWeight: "500", flex: 1 },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  signOutText: { fontWeight: "600", fontSize: 12 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    maxWidth: "100%",
  },
  badgeText: { fontWeight: "700", fontSize: 12 },
  stack: { flexDirection: "row", alignItems: "center" },
  mini: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  miniText: { fontSize: 11, fontWeight: "800" },
  miniMoreText: { fontSize: 10, fontWeight: "800" },
  net: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  netTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  netLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    flex: 1,
  },
  netPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  netDot: { width: 6, height: 6, borderRadius: 3 },
  netPillText: { fontSize: 11.5, fontWeight: "700" },
  netValue: {
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
  },
  ratioFill: {
    height: "100%",
    borderRadius: 999,
  },
  netSplit: { flexDirection: "row", gap: 10 },
  netMini: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  netMiniHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  netMiniIcon: {
    width: 18,
    height: 18,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  netMiniLabel: { fontSize: 11.5, fontWeight: "600" },
  netMiniValue: { marginTop: 5, fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipOn: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontWeight: "600", fontSize: 13.5 },
  chipOnText: { fontWeight: "700", fontSize: 13.5 },
  fabWrap: {
    position: "absolute",
    right: 18,
    bottom: TabClearance,
    borderRadius: 999,
    overflow: "hidden",
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  fab: {
    borderRadius: 999,
    paddingVertical: 13,
    paddingLeft: 14,
    paddingRight: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fabLabel: { fontSize: 14.5, fontWeight: "800" },
  back: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 7,
    paddingRight: 14,
    paddingLeft: 10,
  },
  backText: { fontSize: 13.5, fontWeight: "700" },
});
