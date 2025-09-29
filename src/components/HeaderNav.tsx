import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useRouter } from "expo-router";
import { View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";
import Logo from "./Logo";

type HeaderNavProps = {
  title: string;
  arrow?: Boolean;
};

export default function HeaderNav({ title, arrow }: HeaderNavProps) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between mb-4">
      <View className="flex-row items-center gap-4">
        {arrow ? (
          <FontAwesome5
            name="arrow-left"
            size={20}
            onPress={() => router.back()}
            color={theme === "dark" ? "white" : "black"}
          />
        ) : (
          <Logo className="w-12 h-12" />
        )}
        <AppText
          color={theme === "dark" ? "light" : "dark"}
          className="font-poppins font-extrabold text-2xl"
        >
          {title}
        </AppText>
      </View>
      <View className="flex-row items-center gap-5">
        <Link href={{ pathname: "/(message)" }}>
          <AntDesign
            name="message1"
            size={23}
            color={theme === "dark" ? "white" : "black"}
          />
        </Link>
        <Ionicons
          name="notifications-outline"
          size={24}
          color={theme === "dark" ? "white" : "black"}
        />
      </View>
    </View>
  );
}
