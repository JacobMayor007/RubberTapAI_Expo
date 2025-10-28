import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Link } from "expo-router";
import { View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";

type NavigationProps = {
  active: string;
  userId?: string;
};

export default function NavigationBar({ active, userId }: NavigationProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        boxShadow:
          "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
      }}
      className={`${theme === "dark" ? `bg-gray-900 border-t-[1px] border-white` : `bg-[#FFE2B1]`} mb-4 ${active === "home" ? `` : `mx-4`} rounded-full h-24 pt-1 flex-row items-center justify-between pb-2 `}
    >
      <View className="flex-row items-center justify-around  w-full  py-2">
        <Link href={"/(tabs)/menu"}>
          <View className="flex-col items-center justify-between gap-1 h-14 w-11 ">
            <Entypo
              name="menu"
              size={27}
              color={
                theme === "dark"
                  ? active === "menu"
                    ? "#FFFFFF" // dark mode + active
                    : "#E8C282" // dark mode + not active
                  : active === "menu"
                    ? "#36740A" // light mode + active
                    : "#333333" // light mode + not active
              }
            />
            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className={`${active === "menu" && "font-extrabold text-[#36740A] text-sm"} ${theme === "dark" && active === "menu" && "text-white"}  font-poppins text-xs`}
            >
              Menu
            </AppText>
          </View>
        </Link>
        <Link href={`/(camera)`} className="">
          <View className="flex-col items-center justify-between gap-1 h-14 w-11 text-nowrap">
            <Entypo
              name="camera"
              size={25}
              color={theme === "dark" ? `#E8C282` : `black`}
            />

            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className="font-poppins text-xs"
            >
              Camera
            </AppText>
          </View>
        </Link>
        <Link href={"/(tabs)"}>
          <View className="flex-col items-center justify-between gap-1 h-14 w-11">
            <Entypo
              name="home"
              size={26}
              color={
                theme === "dark"
                  ? active === "home"
                    ? "#FFFFFF"
                    : "#E8C282"
                  : active === "home"
                    ? "#36740A"
                    : "#333333"
              }
            />

            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className={`${active === "home" && "font-extrabold text-[#36740A] text-sm"} ${theme === "dark" && active === "home" && "text-white"}  font-poppins text-xs`}
            >
              Home
            </AppText>
          </View>
        </Link>
        <Link href={"/(tabs)/market"} className="">
          <View className="flex-col items-center justify-between gap-1 h-14 w-11">
            <Entypo
              name="shop"
              size={24}
              color={
                theme === "dark"
                  ? active === "market"
                    ? "#FFFFFF"
                    : "#E8C282"
                  : active === "market"
                    ? "#36740A"
                    : "#333333"
              }
            />
            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className={`${active === "market" && "font-extrabold text-[#36740A] text-sm"} ${theme === "dark" && active === "market" && "text-white"}  font-poppins text-xs`}
            >
              Market
            </AppText>
          </View>
        </Link>
        <Link href={"/(tabs)/history"} className="">
          <View className="flex-col items-center justify-between gap-1 h-14 w-11">
            <FontAwesome6
              name="clock-rotate-left"
              size={23}
              color={
                theme === "dark"
                  ? active === "history"
                    ? "#FFFFFF"
                    : "#E8C282"
                  : active === "history"
                    ? "#36740A"
                    : "#333333"
              }
            />

            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className={`${active === "history" && "font-extrabold text-[#36740A] text-sm"} ${theme === "dark" && active === "history" && "text-white"}  font-poppins text-xs`}
            >
              History
            </AppText>
          </View>
        </Link>
      </View>
    </View>
  );
}
