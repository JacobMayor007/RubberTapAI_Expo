import Ionicons from "@expo/vector-icons/Ionicons";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { useLocation } from "../contexts/LocationContext";
import { useTheme } from "../contexts/ThemeContext";
import { useWeather } from "../contexts/WeatherContext";
import { fetchForecastWeather } from "../services/weatherApi";
import { AppText } from "./AppText";
import Loading from "./LoadingComponent";

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

const daysOfTheWeek = [
  {
    key: 0,
    day: 0,
    label: "Sunday",
  },
  {
    key: 1,
    day: 1,
    label: "Monday",
  },
  {
    key: 2,
    day: 2,
    label: "Tuesday",
  },
  {
    key: 3,
    day: 3,
    label: "Wednesday",
  },
  {
    key: 4,
    day: 4,
    label: "Thursday",
  },
  {
    key: 5,
    day: 5,
    label: "Friday",
  },
  {
    key: 6,
    day: 6,
    label: "Saturday",
  },
];

const WeatherForecast = () => {
  const [forecastDays, setForecastDays] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useLocation();
  const { theme } = useTheme();
  const now = dayjs();
  const { rain, setRain } = useWeather();
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        if (!address?.city) return;

        const weatherData = await fetchForecastWeather(address.city);
        const forecast = weatherData.forecast.forecastday;

        if (forecast[0].hour[dayjs().hour()].will_it_rain) {
          setRain(true);
        } else {
          setRain(false);
        }
        setForecastDays(forecast);
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
    return <Loading className="h-20 w-20 mx-auto " />;
  }

  if (error || forecastDays.length < 1) {
    return <Text>{error}</Text>;
  }

  return (
    <View
      className={`z-20 ${rain ? `bg-white/20` : `bg-white/20`} px-5 py-2 gap-2 rounded-lg`}
    >
      <View className="flex-row items-center  gap-4">
        <View className="bg-white h-10 w-10 items-center justify-center rounded-full">
          <Ionicons
            name="calendar-outline"
            maxFontSizeMultiplier={0.5}
            size={24}
          />
        </View>
        <AppText
          color={theme === "dark" ? "light" : "dark"}
          className="font-poppins font-extrabold text-xl "
        >
          Weather Forecast
        </AppText>
      </View>

      <View
        style={{
          borderRadius: 16,
        }}
        className={` py-4 ${theme === "dark" ? `bg-gray-900 border-[1px] border-white` : ``} justify-center gap-1 flex-col`}
      >
        {forecastDays?.map((data, index) => {
          return (
            <View
              key={index}
              className={`h-16  ${theme === "dark" ? "border-white" : "border-black"}  bg-white rounded-3xl flex-row items-center justify-around gap-1`}
            >
              <AppText
                color={theme === "dark" ? "light" : "dark"}
                className=" font-extrabold "
              >
                {index === 0 && "Today"}
                {index === 1 && "Tomorrow"}
                {index !== 0 &&
                  index !== 1 &&
                  daysOfTheWeek[now.add(index, "day").day()].label}
              </AppText>

              <Image
                className="h-12 w-12"
                source={{
                  uri: `https://${data.hour[dayjs().hour()].condition.icon}`,
                }}
              />

              <AppText
                color={theme === "dark" ? "light" : "dark"}
                className=" font-poppins  font-extrabold text-center"
              >
                {dayjs().format("hh:00 A")}
              </AppText>
              <AppText
                color={theme === "dark" ? "light" : "dark"}
                className="text-[12px]"
              >
                {data?.hour[dayjs().hour()]?.temp_c}&deg;c
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default WeatherForecast;
