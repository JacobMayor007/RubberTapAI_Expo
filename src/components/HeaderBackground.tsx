import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";

export default function HeaderBackground() {
  return (
    <LinearGradient
      colors={["#BFE07B", "#79B400"]}
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
