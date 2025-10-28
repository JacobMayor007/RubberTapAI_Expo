import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { globalFunction } from "../global/fetchWithTimeout";
import { AppText } from "./AppText";
export default function RubberPrice() {
  const [rubberPrice, setRubberPrice] = useState("");
  const [weekChange, setWeekChange] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    const getRubberPrice = async () => {
      const rubberPriceExist = await AsyncStorage.getItem("rubber_price");
      const weekChangeExist = await AsyncStorage.getItem("week_change");
      const todayStorage = await AsyncStorage.getItem("today_date");
      const now = dayjs().format("YYYY-MM-DD");
      const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

      console.log("Rubber Price async: ", rubberPriceExist);
      console.log("Week change async", weekChangeExist);

      console.log(todayStorage);
      console.log(yesterday);

      if (todayStorage === null || todayStorage === yesterday) {
        await AsyncStorage.removeItem("rubber_price");
        await AsyncStorage.removeItem("week_change");
        await AsyncStorage.removeItem("today_date");
      } else {
      }

      if (!rubberPriceExist || !weekChangeExist) {
        console.log("It Mount");

        const response = await globalFunction.fetchWithTimeout(
          `${process.env.EXPO_PUBLIC_BASE_URL}/commodity-price`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
          20000
        );

        const data = await response.json();

        await AsyncStorage.setItem("rubber_price", data.price);
        await AsyncStorage.setItem("week_change", data.weekchange);
        await AsyncStorage.setItem("today_date", now);
        setRubberPrice(data.price);
        setWeekChange(data.weekchange);

        return;
      } else {
        setRubberPrice(rubberPriceExist);
        setWeekChange(weekChangeExist);

        return;
      }
    };

    getRubberPrice();
  }, []);
  return (
    <View
      style={{
        boxShadow: "rgba(232, 194, 130, 0.4) 0px 4px 12px",
      }}
      className={`${theme === "dark" ? "bg-[#202020]" : "bg-white"}  px-4 pt-2 pb-5 rounded-xl gap-1 mb-4`}
    >
      <View className="flex-row justify-between items-center">
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins font-bold text-xl"
        >
          Rubber Price
        </AppText>
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins text-lg font-bold"
        >
          <FontAwesome6
            name="peso-sign"
            size={14}
            color={theme === "dark" ? `light` : `dark`}
          />{" "}
          {((Number(rubberPrice) / 100) * 58).toFixed(2)}
        </AppText>
      </View>
      <View className="flex-row justify-between items-center">
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins font-bold"
        >
          Trading Feeds
        </AppText>

        {weekChange[0] === "-" ? (
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="font-poppins font-bold items-center"
          >
            <Ionicons name="caret-down" color="red" size={16} />
            {weekChange}
          </AppText>
        ) : (
          <AppText className="font-poppins  text-green-500 font-bold items-center">
            <Ionicons name="caret-up" color="green" size={16} />
            {weekChange}
          </AppText>
        )}
      </View>
    </View>
  );
}
