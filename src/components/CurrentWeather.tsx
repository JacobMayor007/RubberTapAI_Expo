import { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { useLocation } from "../contexts/LocationContext";
import { useTheme } from "../contexts/ThemeContext";
import { currentWeather } from "../services/weatherApi";
import { AppText } from "./AppText";

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
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <AppText color={"dark"}>{error}</AppText>;
  }

  return (
    <View className="flex-row">
      <Image
        className="h-14 w-14"
        source={{ uri: `https:${current?.current.condition.icon}` }}
      />
      <View>
        {current?.current.temp_c ? (
          <AppText
            color={theme === "dark" ? "light" : "dark"}
            className="font-poppins font-bold text-lg"
          >
            {current?.current.temp_c}&deg;c
          </AppText>
        ) : (
          <AppText className="text-red-500">No weather data</AppText>
        )}
        <AppText
          color={theme === "dark" ? "light" : "dark"}
          className="font-poppins font-medium"
        >
          {current?.current.condition.text}
        </AppText>
      </View>
    </View>
  );
}
