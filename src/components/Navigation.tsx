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
      className={`${theme === "dark" ? `bg-gray-900 border-t-[1px] border-white` : `bg-[#FFE2B1]`} mb-4 mx-4 rounded-full h-24 pt-1 flex-row items-center justify-between pb-2 `}
    >
      <View className="flex-row items-center justify-around  w-full  py-2">
        <Link href={"/(tabs)/menu"}>
          <View className="flex-col items-center justify-between gap-1 h-14 w-11 ">
            <Entypo
              name="menu"
              size={27}
              color={active === "menu" ? `#36740A` : ``}
            />

            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className={`${active === "menu" && "font-extrabold text-[#36740A] text-sm"}  font-poppins text-xs`}
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
              color={theme === "dark" ? `white` : `black`}
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
              color={active === "home" ? `#36740A` : ``}
            />

            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className={`${active === "home" && "font-extrabold text-[#36740A]" && "text-base"}  font-poppins text-xs`}
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
              color={active === "market" ? `#36740A` : ``}
            />
            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className={`${active === "market" && "font-extrabold text-[#36740A] text-sm"}  font-poppins text-xs`}
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
              color={active === "history" ? `#36740A` : ``}
            />

            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className="font-poppins text-xs"
            >
              History
            </AppText>
          </View>
        </Link>
      </View>
    </View>
  );
}
