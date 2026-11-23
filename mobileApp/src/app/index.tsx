import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { Brand, Mark, Screen, Wordmark } from "@/components/ui";
import { useAuth } from "@/lib/auth";

SplashScreen.preventAutoHideAsync();

export default function Splash() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const rise = useRef(new Animated.Value(12)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    SplashScreen.hideAsync();
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [fade, rise]);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      router.replace(user ? "/(tabs)/groups" : "/login");
    }, 900);
    return () => clearTimeout(timer);
  }, [ready, router, user]);

  return (
    <Screen>
      <View style={styles.screen}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: rise }], alignItems: "center" }}>
          <Mark size="lg" />
          <Wordmark size={40} />
          <Text style={styles.tag}>Split the trip. Keep the peace.</Text>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  tag: { color: Brand.muted, marginTop: 10, fontSize: 15, fontWeight: "500" },
});
