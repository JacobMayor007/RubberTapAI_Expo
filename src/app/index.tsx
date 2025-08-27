import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  ImageBackground,
  Text,
  View,
} from "react-native";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../contexts/AuthContext";
import { account } from "../lib/appwrite";

export default function IndexScreen() {
  const router = useRouter();
  const spinValue = useRef(new Animated.Value(0)).current;
  const [networkChecked, setNetworkChecked] = useState(false);
  const auth = useAuth();

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
      const state = await NetInfo.fetch();

      if (!state.isConnected || !state.isInternetReachable) {
        Alert.alert(
          "Connection Issue",
          state.isConnected
            ? "Poor connection detected"
            : "No internet connection detected"
        );
      }

      setNetworkChecked(true);
    };

    checkConnection();
    return () => {
      spinValue.stopAnimation();
    };
  }, []);

  useEffect(() => {
    if (networkChecked && auth.isReady) {
      const navigate = async () => {
        try {
          await account.get();
          console.log("User exists, redirecting to tabs");
          setTimeout(() => router.replace("/(tabs)"), 1500);
        } catch (error) {
          console.log("No user, redirecting to getStarted");
          setTimeout(() => router.replace("/getStarted"), 1500);
        }
      };
      navigate();
    }
  }, [networkChecked, auth.isReady]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

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
          }
        );

        if (response.ok) {
          console.log("✅ Appwrite reachable and healthy");
          return { status: "online" };
        } else if (response.status >= 500) {
          console.log("⚠️ Appwrite server internal error");
          return { status: "internal-error" };
        } else {
          console.log(
            "❌ Appwrite responded with other error",
            response.status
          );
          return { status: "error", code: response.status };
        }
      } catch (error: any) {
        console.log("💥 Network error or cannot reach Appwrite", error);
        return { status: "unreachable" };
      }
    };
    checkAppwriteAvailability();
  }, []);

  console.log(networkChecked, auth.isReady);

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
