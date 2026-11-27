import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getThemePreference, setThemePreference } from "./storage";

export type ThemeMode = "light" | "dark";

export type ThemePalette = {
  mode: ThemeMode;
  ink: string;
  inkSoft: string;
  moss: string;
  mossDark: string;
  mossSoft: string;
  mossBorder: string;
  sand: string;
  surface: string;
  card: string;
  cardSubtle: string;
  cardSpecular: string;
  coral: string;
  line: string;
  lineStrong: string;
  muted: string;
  placeholder: string;
  good: string;
  goodBg: string;
  goodBorder: string;
  bad: string;
  badBg: string;
  badBorder: string;
  settledBg: string;
  settledBorder: string;
  cream: string;
  onAccent: string;
  cyan: string;
  violet: string;
  inputBg: string;
  ghostBg: string;
  dockBg: string;
  dockBorder: string;
  markBg: string;
  avatarRing: string;
  noticeText: string;
  noticeBadText: string;
  chipBg: string;
  chipBorder: string;
  chipText: string;
  bone: string;
  shadowColor: string;
  shadowOpacity: number;
  primaryGradient: string;
  heroGradient: string;
  createGradient: string;
  avatarTones: readonly { bg: string; fg: string; border: string }[];
};

export const lightPalette: ThemePalette = {
  mode: "light",
  ink: "#0F172A",
  inkSoft: "#334155",
  moss: "#059669",
  mossDark: "#047857",
  mossSoft: "rgba(5, 150, 105, 0.10)",
  mossBorder: "rgba(5, 150, 105, 0.24)",
  sand: "#FFFFFF",
  surface: "#F8FAFC",
  card: "#FFFFFF",
  cardSubtle: "#F8FAFC",
  cardSpecular: "rgba(255, 255, 255, 0.9)",
  coral: "#7C3AED",
  line: "rgba(15, 23, 42, 0.08)",
  lineStrong: "rgba(15, 23, 42, 0.14)",
  muted: "#64748B",
  placeholder: "#94A3B8",
  good: "#059669",
  goodBg: "rgba(5, 150, 105, 0.10)",
  goodBorder: "rgba(5, 150, 105, 0.24)",
  bad: "#E11D48",
  badBg: "rgba(225, 29, 72, 0.09)",
  badBorder: "rgba(225, 29, 72, 0.22)",
  settledBg: "rgba(100, 116, 139, 0.09)",
  settledBorder: "rgba(100, 116, 139, 0.18)",
  cream: "#F1F5F9",
  onAccent: "#FFFFFF",
  cyan: "#0284C7",
  violet: "#7C3AED",
  inputBg: "#F8FAFC",
  ghostBg: "#F8FAFC",
  dockBg: "rgba(255, 255, 255, 0.96)",
  dockBorder: "rgba(15, 23, 42, 0.09)",
  markBg: "#ECFDF5",
  avatarRing: "#FFFFFF",
  noticeText: "#065F46",
  noticeBadText: "#9F1239",
  chipBg: "rgba(2, 132, 199, 0.10)",
  chipBorder: "rgba(2, 132, 199, 0.24)",
  chipText: "#0369A1",
  bone: "#E2E8F0",
  shadowColor: "#0F172A",
  shadowOpacity: 0.06,
  primaryGradient: "linear-gradient(135deg, #059669 0%, #0D9488 100%)",
  heroGradient: "linear-gradient(135deg, rgba(5,150,105,0.06) 0%, rgba(2,132,199,0.03) 60%, rgba(255,255,255,0) 100%)",
  createGradient: "linear-gradient(135deg, rgba(5,150,105,0.06) 0%, rgba(255,255,255,0.95) 100%)",
  avatarTones: [
    { bg: "#ECFDF5", fg: "#047857", border: "rgba(5, 150, 105, 0.18)" },
    { bg: "#E0F2FE", fg: "#0369A1", border: "rgba(2, 132, 199, 0.18)" },
    { bg: "#F3E8FF", fg: "#6D28D9", border: "rgba(124, 58, 237, 0.18)" },
    { bg: "#FFE4E6", fg: "#BE123C", border: "rgba(225, 29, 72, 0.18)" },
    { bg: "#FEF3C7", fg: "#B45309", border: "rgba(217, 119, 6, 0.18)" },
  ],
};

export const darkPalette: ThemePalette = {
  mode: "dark",
  ink: "#F8FAFC",
  inkSoft: "#CBD5E1",
  moss: "#22F59E",
  mossDark: "#06B6D4",
  mossSoft: "rgba(34, 245, 158, 0.14)",
  mossBorder: "rgba(34, 245, 158, 0.30)",
  sand: "#06080E",
  surface: "#0D111C",
  card: "rgba(19, 24, 38, 0.88)",
  cardSubtle: "rgba(8, 11, 19, 0.72)",
  cardSpecular: "rgba(255, 255, 255, 0.14)",
  coral: "#8B5CF6",
  line: "rgba(255, 255, 255, 0.09)",
  lineStrong: "rgba(255, 255, 255, 0.16)",
  muted: "#94A3B8",
  placeholder: "#64748B",
  good: "#22F59E",
  goodBg: "rgba(34, 245, 158, 0.14)",
  goodBorder: "rgba(34, 245, 158, 0.30)",
  bad: "#FB7185",
  badBg: "rgba(251, 113, 133, 0.14)",
  badBorder: "rgba(251, 113, 133, 0.30)",
  settledBg: "rgba(148, 163, 184, 0.12)",
  settledBorder: "rgba(148, 163, 184, 0.22)",
  cream: "#141926",
  onAccent: "#04100B",
  cyan: "#06B6D4",
  violet: "#8B5CF6",
  inputBg: "rgba(7, 9, 16, 0.88)",
  ghostBg: "rgba(255, 255, 255, 0.06)",
  dockBg: "rgba(13, 17, 28, 0.94)",
  dockBorder: "rgba(255, 255, 255, 0.13)",
  markBg: "#0D131F",
  avatarRing: "#131826",
  noticeText: "#D1FAE5",
  noticeBadText: "#FECDD3",
  chipBg: "rgba(6, 182, 212, 0.15)",
  chipBorder: "rgba(6, 182, 212, 0.32)",
  chipText: "#67E8F9",
  bone: "#1E2536",
  shadowColor: "#000000",
  shadowOpacity: 0.48,
  primaryGradient: "linear-gradient(135deg, #22F59E 0%, #06B6D4 100%)",
  heroGradient: "linear-gradient(140deg, rgba(34,245,158,0.16) 0%, rgba(6,182,212,0.10) 48%, rgba(139,92,246,0.18) 100%)",
  createGradient: "linear-gradient(135deg, rgba(34,245,158,0.14) 0%, rgba(6,182,212,0.08) 100%)",
  avatarTones: [
    { bg: "rgba(34, 245, 158, 0.16)", fg: "#34F5A8", border: "rgba(34, 245, 158, 0.28)" },
    { bg: "rgba(6, 182, 212, 0.18)", fg: "#38BDF8", border: "rgba(6, 182, 212, 0.30)" },
    { bg: "rgba(139, 92, 246, 0.20)", fg: "#C4B5FD", border: "rgba(139, 92, 246, 0.32)" },
    { bg: "rgba(251, 113, 133, 0.18)", fg: "#FDA4AF", border: "rgba(251, 113, 133, 0.30)" },
    { bg: "rgba(251, 191, 36, 0.16)", fg: "#FCD34D", border: "rgba(251, 191, 36, 0.28)" },
  ],
};

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemePalette;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    let active = true;
    void getThemePreference().then((saved) => {
      if (active && saved) setMode(saved);
    });
    return () => {
      active = false;
    };
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setMode(next);
    void setThemePreference(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((current) => {
      const next: ThemeMode = current === "light" ? "dark" : "light";
      void setThemePreference(next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      isDark: mode === "dark",
      colors: mode === "dark" ? darkPalette : lightPalette,
      setTheme,
      toggleTheme,
    }),
    [mode, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    return {
      mode: "light",
      isDark: false,
      colors: lightPalette,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return value;
}

export function toneForSeed(seed: string, palette: ThemePalette) {
  let hash = 0;
  const value = seed || "a";
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 997;
  }
  return palette.avatarTones[Math.abs(hash) % palette.avatarTones.length];
}
