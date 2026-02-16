import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  AppState,
  BackHandler,
  Easing,
  Image,
  ImageBackground,
  Text,
  View,
} from "react-native";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { account } from "../lib/appwrite";
import { useUser } from "../hooks/tsHooks";

export default function IndexScreen() {
  const router = useRouter();
  const spinValue = useRef(new Animated.Value(0)).current;
  const [networkChecked, setNetworkChecked] = useState(false);
  const [hasInternet, setHasInternet] = useState(true);
  const { data: auth } = useUser();
  const spin = () => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 19000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => spin());
  };

  useEffect(() => {
    spin();

    const checkConnection = async () => {
      try {
        const state = await NetInfo.fetch();

        if (!state.isConnected || !state.isInternetReachable) {
          setHasInternet(false);
          Alert.alert(
            "⚠️ No Internet Connection",
            state.isConnected
              ? "Poor connection detected. Please check your connection and try again."
              : "No internet connection detected. Please enable internet and try again.",
            [
              {
                text: "Go Back",
                onPress: () => router.back(),
                style: "cancel",
              },
            ],
          );
        } else {
          setHasInternet(true);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
        setHasInternet(false);
        Alert.alert(
          "⚠️ Connection Error",
          "Failed to check internet connection. Please try again.",
          [
            {
              text: "OK",
              onPress: () =>
                AppState.currentState === "active" && BackHandler.exitApp(),
              style: "cancel",
            },
          ],
        );
      }

      setNetworkChecked(true);
    };

    checkConnection();

    return () => {
      spinValue.stopAnimation();
    };
  }, [router]);

  useEffect(() => {
    if (!networkChecked || !hasInternet) return;

    if (auth?.$id) {
      const navigate = async () => {
        try {
          await account.get();
          console.log("✅ User exists, redirecting to tabs");
          setTimeout(() => router.replace("/(tabs)"), 1500);
        } catch (error) {
          console.log("❌ No user, redirecting to getStarted");
          setTimeout(() => router.replace("/getStarted"), 1500);
        }
      };
      navigate();
    }
  }, [networkChecked, hasInternet, auth?.$id, router]);

  // Check Appwrite availability
  useEffect(() => {
    const checkAppwriteAvailability = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}`,
          {
            method: "OPTIONS",
            headers: {
              "X-Appwrite-Project": `${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`,
            },
          },
        );

        if (response.ok) {
          console.log("✅ Appwrite reachable and healthy");
        } else if (response.status >= 500) {
          console.log("⚠️ Appwrite server internal error");
        } else {
          console.log("❌ Appwrite responded with error:", response.status);
        }
      } catch (error: any) {
        console.log("💥 Cannot reach Appwrite:", error.message);
      }
    };

    checkAppwriteAvailability();
  }, []);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView className="h-screen">
      <ImageBackground
        className="h-screen flex-1 justify-center items-center"
        source={require("@/assets/images/Rectangle 24.png")}
      >
        <View>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Image source={require("@/assets/images/Logo.png")} />
          </Animated.View>
          <Image source={require("@/assets/images/RubberTap.png")} />
          <Text className="font-poppins text-xl text-[#75A90A] font-extrabold text-right">
            AI
          </Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
