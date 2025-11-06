import { LinearGradient } from "expo-linear-gradient";
import { Image, ScrollView, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "../contexts/LocationContext";
import { useTheme } from "../contexts/ThemeContext";
import { useWeather } from "../contexts/WeatherContext";
import { AppText } from "./AppText";
import CurrentWeather from "./CurrentWeather";
import HeaderNav from "./HeaderNav";
import NavigationBar from "./Navigation";
import WeatherForecast from "./WeatherForecast";

export default function DashboardBackground() {
  const { profile } = useAuth();
  const { address } = useLocation();
  const { rain } = useWeather();
  const { theme } = useTheme();

  return (
    <LinearGradient
      className="flex-1 relative z-0 p-6 "
      colors={
        theme === "dark"
          ? ["#202020", "#1B1B1B"]
          : rain
            ? ["#7BDEE0", "#F1FDDA"]
            : ["#BFE07B", "#79B400"]
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 0.33, y: 1 }}
    >
      <ScrollView
        contentContainerClassName="gap-4"
        style={{
          marginBottom: 79,
          zIndex: 20,
        }}
      >
        <HeaderNav title="Dashboard" />
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins text-2xl"
        >
          Hello,{" "}
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="font-bold "
          >
            {profile?.fullName?.split(" ")[0]}!
          </AppText>
        </AppText>
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-bold text-xl"
        >
          {address?.subregion}, {address?.city}
        </AppText>
        <CurrentWeather />
        <WeatherForecast />
      </ScrollView>
      <Image
        className="absolute z-10 -top-28 -right-48"
        source={require("@/assets/images/DashboardBackground.png")}
      />
      <Image
        className="absolute z-10 bottom-28 -left-48"
        source={require("@/assets/images/DashboardBackground.png")}
      />
      <View
        className="absolute bottom-0 left-6 z-30 "
        style={{
          backgroundColor: "transparent",
        }}
      >
        <NavigationBar active="home" />
      </View>
    </LinearGradient>
  );
}
