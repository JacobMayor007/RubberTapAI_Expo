import { updateReadAllNotif } from "@/src/action/userAction";
import { AppText } from "@/src/components/AppText";
import { useAuth } from "@/src/contexts/AuthContext";
import { useMessage } from "@/src/contexts/MessageContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { globalFunction } from "@/src/global/fetchWithTimeout";
import { MyNotifications } from "@/types";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AllMyNotifications() {
  const { profile } = useAuth();
  const [myNotifications, setMyNotifications] = useState<MyNotifications[]>([]);
  const [unread, setUnread] = useState(0);

  const { setUser } = useMessage();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (profile?.$id && profile?.API_KEY) {
      getMyNotifs();
    }
  }, [profile]);

  const getMyNotifs = async () => {
    try {
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

      const sortedNotifications = [...data].sort((a, b) => {
        return (
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
      });

      setMyNotifications(sortedNotifications);

      const unreadCount = data.filter(
        (notif: MyNotifications) => !notif.isRead
      ).length;

      setUnread(unreadCount);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMessageUser = async (chatMate_id: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/chat-mate/${chatMate_id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      setUser(data);
    } catch (error) {
      console.error(error);
    } finally {
      router.push({ pathname: "/(message)/messages" });
    }
  };

  const markedAllAsRead = async () => {
    try {
      const response = await updateReadAllNotif(
        profile?.$id || "",
        profile?.API_KEY || ""
      );

      console.log(response);
    } catch (error) {
      console.error(error);
    } finally {
      getMyNotifs();
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          backgroundColor: theme === "light" ? "#FFECCC" : "#111827",
          gap: 10,
          flexGrow: 1,
        }}
      >
        <View className="flex-row items-center gap-5">
          <FontAwesome5
            name="arrow-left"
            size={20}
            color={theme === "dark" ? `#E2C282` : `black`}
            onPress={() => router.back()}
          />
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="font-poppins font-bold text-2xl"
          >
            Notifications
          </AppText>
        </View>
        <View
          className={`flex-row ${unread > 0 ? `justify-between` : `justify-end`}`}
        >
          {unread > 0 && (
            <AppText className="font-poppins text-red-500 font-bold text-lg">
              Unread ({unread})
            </AppText>
          )}
          <TouchableOpacity onPress={markedAllAsRead}>
            <AppText className="font-poppins font-bold text-lg text-blue-500">
              MARK ALL AS READ
            </AppText>
          </TouchableOpacity>
        </View>
        {myNotifications.map((data, index) => {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleMessageUser(data?.userId)}
              className="flex-row items-center gap-4"
            >
              {!data?.isRead && (
                <Text className="h-1 w-1 rounded-full bg-blue-500" />
              )}
              <Image
                src={data?.senderProfile}
                className="h-10 w-10 rounded-full"
              />
              <View className=" border-b-[0.5px] w-9/12 py-2">
                <AppText
                  color={theme === "dark" ? `light` : `dark`}
                  className={`font-poppins ${data?.isRead ? `font-normal text-sm` : `font-bold`} text-base`}
                >
                  {data?.message.length < 43
                    ? data?.message
                    : `${data?.message.slice(0, 42)}...`}
                </AppText>
                <AppText
                  color={theme === "dark" ? `light` : `dark`}
                  className="text-sm"
                >
                  {dayjs(data?.$createdAt).format("MM-DD-YYYY hh:mm A")}
                </AppText>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
