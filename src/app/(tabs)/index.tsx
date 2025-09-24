import { AppText } from "@/src/components/AppText";
import CurrentWeather from "@/src/components/CurrentWeather";
import Logo from "@/src/components/Logo";
import NavigationBar from "@/src/components/Navigation";
import WeatherForecast from "@/src/components/WeatherForecast";
import { useAuth } from "@/src/contexts/AuthContext";
import { useLocation } from "@/src/contexts/LocationContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { globalFunction } from "@/src/global/fetchWithTimeout";
import { Profile } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const [notifToken, setNotifToken] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  const location = useLocation();

  useEffect(() => {
    const isAuthenticate = () => {
      if (!user) {
        router.replace("/(auth)");
      }
    };
    isAuthenticate();
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/user/${user?.$id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Upload error:", error);
      }
    };
    fetchProfile();
  }, [user?.$id]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          router.replace("/(tabs)/market");
          return;
        }

        const coords = await Location.getCurrentPositionAsync();
        if (coords) {
          const { latitude, longitude } = coords.coords;

          const response = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          const res = response[0];
          if (res) {
            location.setAddress(res);
            await AsyncStorage.setItem("user_address", JSON.stringify(res));
          } else {
            console.warn("No reverse geocode result");
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.error("Error getting location info:", error);
        }
      }
    })();

    registerForPushNotificationsAsync();
  }, []);

  function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        handleRegistrationError(
          "Permission not granted to get push token for push notification!"
        );
        return;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError("Project ID not found");
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;

        await insertNotificationToken(pushTokenString);

        return pushTokenString;
      } catch (e: unknown) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError(
        "Must use physical device for push notifications"
      );
    }
  }

  useEffect(() => {
    const getCachedAddress = async () => {
      const cachedAddress = await AsyncStorage.getItem("user_address");

      if (cachedAddress) {
        const address = JSON.parse(cachedAddress);
        location.setAddress(address);
        return address;
      }
      return null;
    };
    getCachedAddress();
  }, []);

  const insertNotificationToken = async (pushToken: string) => {
    try {
      setNotifToken(pushToken);

      const result = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/push-token`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            userId: user?.$id,
            token: pushToken,
            API_KEY: profile?.API_KEY,
          }),
        },
        20000
      );

      const response = await result.json();

      console.log(response.status);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView className="flex-1 ">
      <View
        className={`flex-1 ${theme === "dark" ? "bg-gray-900" : "bg-[#FFECCC]"} flex-col justify-between`}
      >
        <View className=" px-6 py-10 flex-col gap-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-4">
              <Logo className="w-12 h-12" />
              <AppText
                color={theme === "dark" ? "light" : "dark"}
                className="font-poppins font-extrabold text-2xl"
              >
                Dashboard
              </AppText>
            </View>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme === "dark" ? "white" : "black"}
            />
          </View>
          <CurrentWeather />
          <WeatherForecast />
        </View>
        <NavigationBar active="home" userId={user?.$id} />
      </View>
    </SafeAreaView>
  );
}
