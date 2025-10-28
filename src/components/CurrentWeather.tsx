import { useEffect, useState } from "react";
import { View } from "react-native";
import { useLocation } from "../contexts/LocationContext";
import { useTheme } from "../contexts/ThemeContext";
import { currentWeather } from "../services/weatherApi";
import { AppText } from "./AppText";
import Loading from "./LoadingComponent";

interface Current {
  location: {
    name: string;
    region: number;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}

export default function CurrentWeather() {
  const [current, setCurrent] = useState<Current | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { address } = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    const getCurrenData = async () => {
      try {
        if (!address?.city) return; // wait until we have a valid city

        const weatherData = await currentWeather(address.city);
        setCurrent(weatherData);
      } catch (err) {
        setError("Failed to fetch weather data");
        console.error("Error fetching current weather", err);
      } finally {
        setLoading(false);
      }
    };

    getCurrenData();
  }, [address?.city]);

  if (loading) {
    return <Loading className="h-16 w-16" />;
  }

  if (error) {
    return <AppText color={"dark"}>{error}</AppText>;
  }

  return (
    <View className="flex-col z-20 mx-auto">
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-bold text-6xl text-center"
      >
        {current?.current.temp_c}&#176;
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className=" text-lg font-bold text-center"
      >
        {current?.current.condition.text}
      </AppText>
    </View>
  );
}
