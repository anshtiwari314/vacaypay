import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

import { Screen, Wordmark } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useAppTheme } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

const icon = require("../../assets/images/icon.png");

export default function Splash() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const { colors } = useAppTheme();
  const rise = useRef(new Animated.Value(12)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0.08)).current;
  const [phase, setPhase] = useState<"launch" | "splash">("launch");

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: ready ? 1 : 0.86,
      duration: ready ? 320 : 1400,
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished && ready) setPhase("splash");
    });
    return () => animation.stop();
  }, [progress, ready]);

  useEffect(() => {
    if (phase !== "splash") return;
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => {
      router.replace(user ? "/(tabs)/groups" : "/login");
    }, 900);
    return () => clearTimeout(timer);
  }, [fade, phase, rise, router, user]);

  if (phase === "launch") {
    const width = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
    return (
      <View style={styles.launch}>
        <Image source={icon} style={styles.icon} />
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width }]} />
        </View>
      </View>
    );
  }

  return (
    <Screen>
      <View style={styles.screen}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: rise }], alignItems: "center" }}>
          <Wordmark size={40} />
          <Text style={[styles.tag, { color: colors.muted }]}>Split the trip. Keep the peace.</Text>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  launch: {
    flex: 1,
    backgroundColor: "#071622",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 112,
    height: 112,
    borderRadius: 26,
  },
  track: {
    width: 168,
    height: 4,
    marginTop: 36,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#34D399",
  },
  screen: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  tag: { marginTop: 10, fontSize: 15, fontWeight: "500" },
});
