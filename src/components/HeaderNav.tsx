import { MyNotifications } from "@/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { globalFunction } from "../global/fetchWithTimeout";
import { AppText } from "./AppText";
import Logo from "./Logo";

type HeaderNavProps = {
  title: string;
  arrow?: Boolean;
};

export default function HeaderNav({ title, arrow }: HeaderNavProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const { profile } = useAuth();

  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const getMyNotifs = async () => {
      try {
        // const response = await getMyUnreadNotif(
        //   profile?.$id || "",
        //   profile?.API_KEY || ""
        // );

        // const data = await response.json();

        const response = await globalFunction.fetchWithTimeout(
          `${process.env.EXPO_PUBLIC_BASE_URL}/notifications`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: profile?.$id,
              API_KEY: profile?.API_KEY,
            }),
          },
          20000
        );

        const data = await response.json();
        if (data.items === 0) {
          return;
        }
        const unreadCount = data.filter(
          (notif: MyNotifications) => !notif.isRead
        ).length;

        setUnread(unreadCount);
      } catch (error) {
        console.error(error);
      }
    };

    if (profile?.$id && profile?.API_KEY) {
      getMyNotifs();
    }
  }, [profile]);

  return (
    <View className="flex-row items-center justify-between mb-4  pt-1">
      <View className="flex-row items-center gap-4">
        {arrow ? (
          <FontAwesome5
            name="arrow-left"
            size={20}
            onPress={() => router.back()}
            color={theme === "dark" ? "#E2C282" : "black"}
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
      <View className="flex-row items-center gap-5 py-4">
        <Link href="/(message)">
          <AntDesign
            name="message1"
            size={23}
            color={theme === "dark" ? "#E8C282" : "black"}
          />
        </Link>
        <Link href={{ pathname: "/(tabs)/myNotifications" }}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={theme === "dark" ? "#E8C282" : "black"}
          />
        </Link>
      </View>
      {unread > 1 && (
        <AppText className=" px-1.5 top-0 right-0 py-1 bg-red-500 text-white absolute rounded-full items-center justify-center">
          {unread}
        </AppText>
      )}
    </View>
  );
}
