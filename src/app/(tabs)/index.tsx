import { AppText } from "@/src/components/AppText";
import CurrentWeather from "@/src/components/CurrentWeather";
import Logo from "@/src/components/Logo";
import WeatherForecast from "@/src/components/WeatherForecast";
import { useAuth } from "@/src/contexts/AuthContext";
import { useLocation } from "@/src/contexts/LocationContext";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
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
          setLatitude(latitude);
          setLongitude(longitude);

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
        console.error("Error getting location info:", error);
      } finally {
        router.reload();
      }
    })();
  }, []);

  useEffect(() => {
    const getCachedAddress = async () => {
      const cachedAddress = await AsyncStorage.getItem("user_address");
      if (cachedAddress) {
        const address = JSON.parse(cachedAddress);
        console.log("Cached address: ", address);
        location.setAddress(address);
        return address;
      }
      return null;
    };
    getCachedAddress();
  }, []);

  return (
    <SafeAreaView className="flex-1 ">
      <View className="flex-1 bg-[#E8DFD0] flex-col justify-between">
        <View className=" px-6 py-10 flex-col gap-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-4">
              <Logo className="w-12 h-12" />
              <AppText
                color="dark"
                className="font-poppins font-extrabold text-2xl"
              >
                Dashboard
              </AppText>
            </View>
            <Ionicons name="notifications-outline" size={23} />
          </View>
          <CurrentWeather />
          <WeatherForecast />
        </View>
        <View className="bg-white h-20 flex-row items-center justify-between px-7 pb-2">
          <Feather
            name="menu"
            size={24}
            onPress={() => router.push("/(tabs)/menu")}
          />
          <Feather name="camera" size={24} />
          <View className="mb-16 h-20 w-20 rounded-full bg-[#E8DFD0] items-center justify-center p-1.5">
            <View className="bg-white h-full w-full rounded-full items-center justify-center">
              <Entypo name="home" size={32} />
            </View>
          </View>
          <FontAwesome
            name="arrow-trend-up"
            size={20}
            onPress={() => router.push("/(tabs)/market")}
          />
          <FontAwesome name="clock-rotate-left" size={20} />
        </View>
      </View>
    </SafeAreaView>
  );
}
