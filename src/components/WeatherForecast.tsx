import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { useLocation } from "../contexts/LocationContext";
import { useTheme } from "../contexts/ThemeContext";
import { fetchForecastWeather } from "../services/weatherApi";
import { AppText } from "./AppText";

interface ForecastDay {
  date: string;
  date_epoch: number;
  day: {
    avgtemp_c: number;
    condition: {
      text: string;
      icon: string;
    };
  };
  hour: Array<{
    time: string;
    temp_c: string;
    condition: {
      text: string;
      icon: string;
    };
    will_it_rain: number;
    chance_of_rain: number;
  }>;
}

const WeatherForecast = () => {
  const [forecastDays, setForecastDays] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useLocation();
  const { theme } = useTheme();
  const now = dayjs();

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        if (!address?.city) return;

        const weatherData = await fetchForecastWeather(address.city);

        setForecastDays(weatherData.forecast.forecastday);
      } catch (err) {
        setError("Failed to fetch weather data");
        console.error("Error fetching forecast:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [address?.city]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error || forecastDays.length < 1) {
    return <Text>{error}</Text>;
  }

  forecastDays.forEach((day, dayIndex) => {
    console.log(`--- Day ${dayIndex + 1}: ${day.date} ---`);
    day.hour.forEach((hourObj, hourIndex) => {
      console.log(
        `Time: ${hourObj.time}, Temp: ${hourObj.temp_c}°C, Condition: ${hourObj.condition.text}`
      );
    });
  });

  console.log(JSON.stringify(forecastDays[0].hour[dayjs().hour()], null, 2));
  console.log(address);

  return (
    <View>
      <AppText
        color={theme === "dark" ? "light" : "dark"}
        className="font-poppins font-extrabold text-xl mb-3"
      >
        Weather Forecast
      </AppText>
      <AppText></AppText>
      <View
        style={{
          borderRadius: 16,
          boxShadow:
            "4px 5px 4px 1px rgba(0, 0, 0, 0.1), 0 5px 16px 0 rgba(0, 0, 0, 0.2)",
        }}
        className={`h-72 py-4 ${theme === "dark" ? `bg-gray-900 border-[1px] border-white` : ``} justify-center gap-1 flex-row`}
      >
        {forecastDays?.map((data, index) => {
          return (
            <View
              key={index}
              className={` w-[18%] ${theme === "dark" ? "border-white" : "border-black"} border-[1px] rounded-full flex-col justify-between`}
            >
              <View className="flex-col items-center pt-4 gap-1">
                <AppText
                  color={theme === "dark" ? "light" : "dark"}
                  className="text-sm font-extrabold"
                >
                  {now.add(index, "day").format("MM/D")}
                </AppText>
                <AppText
                  color={theme === "dark" ? "light" : "dark"}
                  className=" font-poppins font-extrabold"
                >
                  6:00 AM
                </AppText>
                <AppText
                  color={theme === "dark" ? "light" : "dark"}
                  className="text-[12px]"
                >
                  {data?.hour[6]?.temp_c}&deg;c
                </AppText>
                <Image
                  className="h-12 w-12"
                  source={{ uri: `https://${data.hour[6].condition.icon}` }}
                />
              </View>
              <View className="flex-col items-center py-4 gap-1">
                <AppText
                  color={theme === "dark" ? "light" : "dark"}
                  className="text-sm font-extrabold font-poppins"
                >
                  6:00 PM
                </AppText>
                <AppText
                  color={theme === "dark" ? "light" : "dark"}
                  className="text-[12px]"
                >
                  {data?.hour[18]?.temp_c}&deg;c
                </AppText>
                <Image
                  className="h-12 w-12"
                  source={{ uri: `https://${data.hour[18].condition.icon}` }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default WeatherForecast;
