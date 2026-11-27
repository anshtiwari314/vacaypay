import { SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk/700Bold";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "@/lib/auth";
import { ThemeProvider, useAppTheme } from "@/lib/theme";

function RootNavigator() {
  const { isDark, colors } = useAppTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.sand },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="create-group" options={{ presentation: "modal" }} />
        <Stack.Screen name="add-expense" options={{ presentation: "modal" }} />
        <Stack.Screen name="group/[id]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsReady] = useFonts({ SpaceGrotesk_700Bold });
  if (!fontsReady) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
