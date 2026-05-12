import { LinearGradient } from "expo-linear-gradient";
import {
  AppState,
  AppStateStatus,
  Image,
  PanResponder,
  View,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useWeather } from "../contexts/WeatherContext";
import { cn } from "../utils/cn";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { account } from "../lib/appwrite";
import AsyncStorage from "@react-native-async-storage/async-storage";

type BackgroundGradientProps = {
  children?: React.ReactNode;
  className?: string;
};

export default function BackgroundGradient({
  children,
  className,
}: BackgroundGradientProps) {
  const { theme } = useTheme();
  const { rain } = useWeather();
  const appState = useRef(AppState.currentState); // Track AppState
  const timerId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // 15 minutes in milliseconds
  const INACTIVITY_LIMIT = 15 * 60 * 1000;

  const logoutUser = async () => {
    try {
      // 1. Clear the timestamp so it doesn't trigger for the next login
      await AsyncStorage.removeItem("lastActivity");

      // 2. Clear Appwrite session
      await account.deleteSession({ sessionId: "current" });

      // 3. Wipe the cache
      queryClient.clear();

      // 4. Redirect
      router.replace("/login");
    } catch (error) {
      // If the session is already invalid, just redirect anyway
      router.replace("/login");
    }
  };

  const resetTimer = () => {
    if (timerId.current) clearTimeout(timerId.current);
    timerId.current = setTimeout(logoutUser, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    resetTimer();

    // LISTEN FOR APP STATE CHANGES (Background/Foreground)
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // App is coming back to foreground
          const lastSeen = await AsyncStorage.getItem("lastActivity");
          if (lastSeen) {
            const elapsed = Date.now() - parseInt(lastSeen, 10);
            if (elapsed >= INACTIVITY_LIMIT) {
              logoutUser(); // Too much time passed while app was closed
              return;
            }
          }
          resetTimer();
        } else if (nextAppState.match(/inactive|background/)) {
          // App is going into background - Save the timestamp!
          await AsyncStorage.setItem("lastActivity", Date.now().toString());
        }
        appState.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
      if (timerId.current) clearTimeout(timerId.current);
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetTimer();
        return false; // Crucial: lets children (buttons) receive the touch
      },
    }),
  ).current;
  return (
    <LinearGradient
      className={cn("flex-1 relative", className)}
      colors={
        theme === "dark"
          ? ["#202020", "#1B1B1B"]
          : rain
            ? ["#7BDEE0", "#F1FDDA"]
            : ["#BFE07B", "#79B400"]
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 0.33, y: 1 }}
      {...panResponder.panHandlers}
    >
      <Image
        className="absolute z-0 -top-28 -right-48 opacity-70"
        source={require("@/assets/images/DashboardBackground.png")}
      />
      <Image
        className="absolute z-0 bottom-28 -left-48 opacity-70"
        source={require("@/assets/images/DashboardBackground.png")}
      />

      {/* Foreground content */}
      <View className="flex-1 z-10">{children}</View>
    </LinearGradient>
  );
}
