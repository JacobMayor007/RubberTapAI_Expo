import { LinearGradient } from "expo-linear-gradient";
import { Image, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useWeather } from "../contexts/WeatherContext";
import { cn } from "../utils/cn";
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
