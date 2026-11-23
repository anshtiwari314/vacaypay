import { SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk/700Bold";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Brand } from "@/components/ui";
import { AuthProvider } from "@/lib/auth";

export default function RootLayout() {
  const [fontsReady] = useFonts({ SpaceGrotesk_700Bold });
  if (!fontsReady) return null;

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Brand.sand },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="create-group" options={{ presentation: "modal" }} />
        <Stack.Screen name="add-expense" options={{ presentation: "modal" }} />
        <Stack.Screen name="group/[id]" />
      </Stack>
    </AuthProvider>
  );
}
