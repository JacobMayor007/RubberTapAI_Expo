import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";
import { useWeather } from "../contexts/WeatherContext";

export default function HeaderBackground() {
  const { rain } = useWeather();
  return (
    <LinearGradient
      colors={rain ? ["#7BDEE0", "#F1FDDA"] : ["#BFE07B", "#79B400"]}
      className="absolute z-10 h-[22%] w-full  flex-row justify-between "
    >
      <Image
        source={require("@/assets/images/Ellipse.png")}
        style={{ transform: "rotate(220deg)" }}
      />
      <Image source={require("@/assets/images/Ellipse.png")} />
    </LinearGradient>
  );
}
