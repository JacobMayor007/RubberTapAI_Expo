import { AppText } from "@/src/components/AppText";
import CurrentWeather from "@/src/components/CurrentWeather";
import Logo from "@/src/components/Logo";
import NavigationBar from "@/src/components/Navigation";
import WeatherForecast from "@/src/components/WeatherForecast";
import { useAuth } from "@/src/contexts/AuthContext";
import { useLocation } from "@/src/contexts/LocationContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

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
  }, []);

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
