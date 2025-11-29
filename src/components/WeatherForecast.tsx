import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocation } from "../contexts/LocationContext";
import { useTheme } from "../contexts/ThemeContext";
import { useWeather } from "../contexts/WeatherContext";
import { fetchForecastWeather } from "../services/weatherApi";
import { AppText } from "./AppText";
import BackgroundGradient from "./BackgroundGradient";
import Loading from "./LoadingComponent";

interface HourlyData {
  time: string;
  temp_c: string;
  condition: {
    text: string;
    icon: string;
  };
  will_it_rain: number;
  chance_of_rain: number;
  humidity: number;
  wind_kph: number;
  pressure_mb: number;
  precip_mm: number;
  vis_km: number;
}

interface ForecastDay {
  date: string;
  date_epoch: number;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    avgtemp_c: number;
    maxwind_kph: number;
    totalprecip_mm: number;
    avghumidity: number;
    daily_chance_of_rain: number;
    condition: {
      text: string;
      icon: string;
    };
    uv: number;
  };
  astro: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    moon_phase: string;
    moon_illumination: number;
  };
  hour: HourlyData[];
}

const daysOfTheWeek = [
  { key: 0, day: 0, label: "Sunday" },
  { key: 1, day: 1, label: "Monday" },
  { key: 2, day: 2, label: "Tuesday" },
  { key: 3, day: 3, label: "Wednesday" },
  { key: 4, day: 4, label: "Thursday" },
  { key: 5, day: 5, label: "Friday" },
  { key: 6, day: 6, label: "Saturday" },
];

const WeatherForecast = () => {
  const [forecastDays, setForecastDays] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useLocation();
  const { theme } = useTheme();
  const now = dayjs();
  const { rain, setRain } = useWeather();

  // 🔹 Modal state
  const [selectedDay, setSelectedDay] = useState<ForecastDay | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

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

  // 🔹 Handle day selection
  const handleDayPress = (day: ForecastDay, index: number) => {
    setSelectedDay(day);
    setSelectedDayIndex(index);
    setModalVisible(true);
  };

  // 🔹 Get day label
  const getDayLabel = (index: number) => {
    if (index === 0) return "Today";
    if (index === 1) return "Tomorrow";
    return daysOfTheWeek[now.add(index, "day").day()].label;
  };

  if (loading) {
    return <Loading className="h-16 w-16 mx-auto" />;
  }

  if (error || forecastDays.length < 1) {
    return <Text>{error}</Text>;
  }

  return (
    <>
      <View
        className={`z-20 ${theme === "dark" ? `bg-black/80` : `bg-white/50`} px-5 py-2 gap-2 rounded-lg`}
      >
        <View className="flex-row items-center gap-4">
          <View className="bg-white h-10 w-10 items-center justify-center rounded-full">
            <Ionicons
              name="calendar-outline"
              maxFontSizeMultiplier={0.5}
              size={24}
            />
          </View>
          <AppText
            color={theme === "dark" ? "light" : "dark"}
            className="font-poppins font-extrabold text-xl"
          >
            Weather Forecast
          </AppText>
        </View>

        <View
          className="py-4 justify-center gap-1 flex-col"
          style={{ borderRadius: 16 }}
        >
          {forecastDays?.map((data, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleDayPress(data, index)}
                className={`h-16 ${
                  theme === "dark" ? "border-white" : "border-black"
                } ${theme === "dark" ? "bg-black/70" : "bg-white"} 
    rounded-3xl flex-row items-center justify-evenly px-4`}
              >
                <AppText
                  color={theme === "dark" ? "light" : "dark"}
                  className="font-extrabold text-center flex-1"
                >
                  {getDayLabel(index)}
                </AppText>

                <Image
                  className="h-12 w-12 flex-1"
                  resizeMode="contain"
                  source={{
                    uri: `https://${data.hour[dayjs().hour()].condition.icon}`,
                  }}
                />

                <AppText
                  color={theme === "dark" ? "light" : "dark"}
                  className="font-poppins font-extrabold text-center flex-1"
                >
                  {dayjs().format("hh:00 A")}
                </AppText>

                <AppText
                  color={theme === "dark" ? "light" : "dark"}
                  className="text-[12px] text-center flex-1"
                >
                  {data?.hour[dayjs().hour()]?.temp_c}&deg;c
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Modal
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <BackgroundGradient className={`flex-1 `}>
          <View className={`flex-1 rounded-t-3xl  `}>
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
              <View>
                <AppText
                  color={theme === "dark" ? "light" : "dark"}
                  className="font-poppins font-black text-2xl"
                >
                  {getDayLabel(selectedDayIndex)}
                </AppText>
                <AppText
                  color={theme === "dark" ? "light" : "dark"}
                  className="text-sm opacity-60 mt-1"
                >
                  {selectedDay &&
                    dayjs(selectedDay.date).format("dddd, MMMM DD")}
                </AppText>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className={`p-2 rounded-full ${
                  theme === "dark" ? "bg-gray-800" : "bg-gray-200"
                }`}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme === "dark" ? "white" : "black"}
                />
              </TouchableOpacity>
            </View>

            {selectedDay && (
              <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
              >
                <View className={`rounded-2xl p-6 mb-6 overflow-hidden`}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <AppText
                        color={theme === "dark" ? "light" : "dark"}
                        className="text-2xl font-bold mb-2"
                      >
                        {selectedDay.day.condition.text}
                      </AppText>
                      <View className="flex-row gap-6 mt-4">
                        <View>
                          <AppText
                            color={theme === "dark" ? "light" : "dark"}
                            className="text-xs opacity-70 mb-1 font-semibold"
                          >
                            HIGH
                          </AppText>
                          <AppText
                            color={theme === "dark" ? "light" : "dark"}
                            className="text-3xl font-black"
                          >
                            {selectedDay.day.maxtemp_c}°
                          </AppText>
                        </View>
                        <View>
                          <AppText
                            color={theme === "dark" ? "light" : "dark"}
                            className="text-xs opacity-70 mb-1 font-semibold"
                          >
                            LOW
                          </AppText>
                          <AppText
                            color={theme === "dark" ? "light" : "dark"}
                            className="text-3xl font-black"
                          >
                            {selectedDay.day.mintemp_c}°
                          </AppText>
                        </View>
                      </View>
                    </View>
                    <Image
                      className="h-16 w-16"
                      resizeMode="contain"
                      source={{
                        uri: `https://${selectedDay.day.condition.icon}`,
                      }}
                    />
                  </View>
                </View>

                <View className="flex-row justify-between gap-2 mb-6">
                  <View
                    className={`flex-1 p-4 rounded-xl ${
                      theme === "dark" ? "bg-gray-800/50" : "bg-gray-100"
                    }`}
                  >
                    <Ionicons
                      name="water"
                      size={20}
                      color={theme === "dark" ? "#60a5fa" : "#3b82f6"}
                    />
                    <AppText
                      color={theme === "dark" ? "light" : "dark"}
                      className="text-xs opacity-70 mt-2 mb-1"
                    >
                      Rain
                    </AppText>
                    <AppText
                      color={theme === "dark" ? "light" : "dark"}
                      className="font-bold text-lg"
                    >
                      {selectedDay.day.daily_chance_of_rain}%
                    </AppText>
                  </View>
                  <View
                    className={`flex-1 p-4 rounded-xl ${
                      theme === "dark" ? "bg-gray-800/50" : "bg-gray-100"
                    }`}
                  >
                    <Ionicons
                      name="speedometer"
                      size={20}
                      color={theme === "dark" ? "#34d399" : "#10b981"}
                    />
                    <AppText
                      color={theme === "dark" ? "light" : "dark"}
                      className="text-xs opacity-70 mt-2 mb-1"
                    >
                      Wind
                    </AppText>
                    <AppText
                      color={theme === "dark" ? "light" : "dark"}
                      className="font-bold text-lg"
                    >
                      {Math.round(selectedDay.day.maxwind_kph)} km/h
                    </AppText>
                  </View>
                  <View
                    className={`flex-1 p-4 rounded-xl ${
                      theme === "dark" ? "bg-gray-800/50" : "bg-gray-100"
                    }`}
                  >
                    <Ionicons
                      name="cloud"
                      size={20}
                      color={theme === "dark" ? "#fbbf24" : "#f59e0b"}
                    />
                    <AppText
                      color={theme === "dark" ? "light" : "dark"}
                      className="text-xs opacity-70 mt-2 mb-1"
                    >
                      Humidity
                    </AppText>
                    <AppText
                      color={theme === "dark" ? "light" : "dark"}
                      className="font-bold text-lg"
                    >
                      {selectedDay.day.avghumidity}%
                    </AppText>
                  </View>
                </View>

                <AppText
                  color={theme === "dark" ? "light" : "dark"}
                  className="font-poppins font-black text-lg mb-4"
                >
                  Hourly Forecast
                </AppText>

                {selectedDay.hour.map((hour, index) => {
                  const hourTime = dayjs(hour.time).format("h:00 A");
                  const isCurrentHour =
                    index === dayjs().hour() && selectedDayIndex === 0;

                  return (
                    <View
                      key={index}
                      className={`mb-3 p-4 rounded-xl flex-row items-center justify-between ${
                        isCurrentHour
                          ? theme === "dark"
                            ? "bg-gradient-to-r from-green-900/50 to-emerald-900/50"
                            : "bg-gradient-to-r from-green-200 to-emerald-200"
                          : theme === "dark"
                            ? "bg-gray-800/40"
                            : "bg-gray-50"
                      }`}
                      style={{
                        shadowColor: isCurrentHour ? "#10b981" : "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isCurrentHour ? 0.2 : 0.05,
                        shadowRadius: 4,
                        paddingVertical: isCurrentHour ? 20 : 16,
                        elevation: isCurrentHour ? 3 : 1,
                      }}
                    >
                      {/* Time */}
                      <View className="min-w-[70px] rounded-md">
                        <AppText
                          color={theme === "dark" ? "light" : "dark"}
                          className="font-bold text-base"
                        >
                          {hourTime}
                        </AppText>
                        {isCurrentHour && (
                          <View className="bg-green-500 rounded-full px-2 mt-1">
                            <AppText
                              color="light"
                              className="text-xs font-bold text-center"
                            >
                              Now
                            </AppText>
                          </View>
                        )}
                      </View>

                      <Image
                        className="h-12 w-12 mx-2"
                        resizeMode="contain"
                        source={{
                          uri: `https://${hour.condition.icon}`,
                        }}
                      />

                      <View className="min-w-[50px]">
                        <AppText
                          color={theme === "dark" ? "light" : "dark"}
                          className="font-black text-lg text-center"
                        >
                          {hour.temp_c}°
                        </AppText>
                      </View>

                      <View className="flex-1 min-w-[60px] items-center mx-2">
                        <Ionicons
                          name={hour.will_it_rain ? "water" : "water-outline"}
                          size={18}
                          color={
                            hour.will_it_rain
                              ? "#3b82f6"
                              : theme === "dark"
                                ? "#9ca3af"
                                : "#d1d5db"
                          }
                        />
                        <AppText
                          color={theme === "dark" ? "light" : "dark"}
                          className="text-xs font-semibold mt-1"
                        >
                          {hour.chance_of_rain}%
                        </AppText>
                      </View>

                      <View className="flex-1 min-w-[60px] items-center mx-2">
                        <Ionicons
                          name="speedometer"
                          size={18}
                          color={theme === "dark" ? "#60a5fa" : "#3b82f6"}
                        />
                        <AppText
                          color={theme === "dark" ? "light" : "dark"}
                          className="text-xs font-semibold mt-1"
                        >
                          {Math.round(hour.wind_kph)}
                        </AppText>
                      </View>

                      <View className="flex-1 min-w-[60px] items-center">
                        <Ionicons
                          name="cloud"
                          size={18}
                          color={theme === "dark" ? "#fbbf24" : "#f59e0b"}
                        />
                        <AppText
                          color={theme === "dark" ? "light" : "dark"}
                          className="text-xs font-semibold mt-1"
                        >
                          {hour.humidity}%
                        </AppText>
                      </View>
                    </View>
                  );
                })}

                <View className="mt-8 mb-8">
                  <AppText
                    color={theme === "dark" ? "light" : "dark"}
                    className="font-poppins font-black text-lg mb-4"
                  >
                    Daily Summary
                  </AppText>
                  <View
                    className={`rounded-2xl p-6 ${
                      theme === "dark"
                        ? "bg-gradient-to-br from-purple-900/50 to-pink-900/50"
                        : "bg-gradient-to-br from-purple-100 to-pink-100"
                    }`}
                    style={{}}
                  >
                    <View className="flex-row items-center mb-4">
                      <Ionicons
                        name="sunny"
                        size={24}
                        color={theme === "dark" ? "#fbbf24" : "#f59e0b"}
                      />
                      <View className="flex-1 ml-4">
                        <AppText
                          color={theme === "dark" ? "light" : "dark"}
                          className="text-xs opacity-70 font-semibold"
                        >
                          SUNRISE
                        </AppText>
                        <AppText
                          color={theme === "dark" ? "light" : "dark"}
                          className="font-bold text-lg"
                        >
                          {selectedDay.astro.sunrise}
                        </AppText>
                      </View>
                    </View>

                    <View className="flex-row items-center mb-4">
                      <Ionicons
                        name="moon"
                        size={24}
                        color={theme === "dark" ? "#60a5fa" : "#3b82f6"}
                      />
                      <View className="flex-1 ml-4">
                        <AppText
                          color={theme === "dark" ? "light" : "dark"}
                          className="text-xs opacity-70 font-semibold"
                        >
                          SUNSET
                        </AppText>
                        <AppText
                          color={theme === "dark" ? "light" : "dark"}
                          className="font-bold text-lg"
                        >
                          {selectedDay.astro.sunset}
                        </AppText>
                      </View>
                    </View>

                    <View className="flex-row items-center">
                      <Ionicons
                        name="star"
                        size={24}
                        color={theme === "dark" ? "#c084fc" : "#a855f7"}
                      />
                      <View className="flex-1 ml-4">
                        <AppText
                          color={theme === "dark" ? "light" : "dark"}
                          className="text-xs opacity-70 font-semibold"
                        >
                          MOON PHASE
                        </AppText>
                        <AppText
                          color={theme === "dark" ? "light" : "dark"}
                          className="font-bold text-lg"
                        >
                          {selectedDay.astro.moon_phase}
                        </AppText>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </BackgroundGradient>
      </Modal>
    </>
  );
};

export default WeatherForecast;
