import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useWeather } from "../contexts/WeatherContext";

export default function HeaderBackground() {
  const { rain } = useWeather();
  const { theme } = useTheme();
  return (
    <LinearGradient
      colors={
        theme === "dark"
          ? ["#202020", "#1B1B1B"]
          : rain
            ? ["#7BDEE0", "#F1FDDA"]
            : ["#BFE07B", "#79B400"]
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 0.33, y: 1 }}
      className="absolute z-10  w-full  flex-row justify-between "
    >
      <Image
        source={require("@/assets/images/Ellipse.png")}
        style={{ transform: "rotate(220deg)" }}
      />
      <Image source={require("@/assets/images/Ellipse.png")} />
    </LinearGradient>
  );
}
