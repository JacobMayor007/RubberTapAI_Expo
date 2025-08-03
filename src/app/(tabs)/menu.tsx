import { getUserByIdDirect } from "@/src/action/userAction";
import AppearanceSettings from "@/src/components/AppearanceSettings";
import { AppText } from "@/src/components/AppText";
import HelpAndSupport from "@/src/components/HelpAndSupport";
import Logo from "@/src/components/Logo";
import Logout from "@/src/components/Logout";
import NotificationSettings from "@/src/components/NotificationSettings";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface User {
  $id: string;
  $createdAt?: string;
  username: string;
  notifSettings: string;
  themeSettings: string;
  subscription: string;
  imageURL: string;
}

export default function Menu() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [emailHide, setEmailHide] = useState("");
  const [visibleModal, setVisibleModal] = useState(false);
  const [modalShown, setModalShown] = useState("");

  const { theme } = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.$id) {
        const userProfile = await getUserByIdDirect(user.$id);
        setProfile(userProfile);
      }
    };
    fetchProfile();
  }, [user?.$id]);

  useEffect(() => {
    const emailToHide = user?.email.split("@")[0];
    var asterisk = "";
    for (var i = 0; i < Number(emailToHide?.length); i++) {
      asterisk += "*";
    }
    setEmailHide(asterisk);
  }, [user?.email, setEmailHide]);

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 flex-col justify-between">
        <View
          className={`${theme === "dark" ? `bg-gray-900` : `bg-[#E8DFD0]`} flex-1 px-6 py-10 flex-col`}
        >
          <View className="flex-row items-center justify-between ">
            <View className="flex-row items-center gap-4">
              <FontAwesome5
                name="arrow-left"
                size={20}
                color={theme === "dark" ? "white" : "black"}
                onPress={() => router.back()}
              />
              <AppText
                color={theme === "dark" ? "light" : "dark"}
                className="font-poppins font-extrabold text-2xl"
              >
                Menu
              </AppText>
            </View>
            <Logo className="w-12 h-12" />
          </View>
          <View
            className={`h-72 rounded-2xl ${theme === "dark" ? `bg-black` : `bg-white`} drop-shadow-lg mt-8`}
          >
            <LinearGradient
              colors={["#75A90A", "#046A10"]}
              style={{
                width: "100%",
                height: 80,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
              }}
            />
            <View className="flex-row justify-between items-center px-4">
              <View className="flex-row items-center  gap-2 -mt-5 overflow-hidden w-[75%] text-nowrap">
                <Image
                  className="h-14 w-14 rounded-full"
                  source={{ uri: profile?.imageURL }}
                />
                <AppText
                  color={theme === "dark" ? "light" : "dark"}
                  className="font-poppins font-bold text-lg pt-4 text-ellipsis text-nowrap whitespace-nowrap"
                >
                  {user?.name}
                </AppText>
              </View>
              <View
                className={`${theme !== "dark" ? `bg-[#75A90A]` : `bg-gray-600`} h-7 w-16 justify-center items-center rounded-full`}
              >
                <AppText color={`light`}>Edit</AppText>
              </View>
            </View>
            <View
              className={`"flex-1 ${theme === "dark" ? `bg-gray-900` : `bg-[#f5eee4]`} m-4 rounded-xl drop-shadow-2xl flex-col py-2 px-4 gap-1"`}
            >
              <AppText
                color={theme === "dark" ? "light" : "dark"}
                className="font-poppins font-extrabold text-base"
              >
                Username
              </AppText>
              <AppText color={theme === "dark" ? "light" : "dark"}>
                {profile?.username}
              </AppText>
              <AppText
                color={theme === "dark" ? "light" : "dark"}
                className="font-poppins font-extrabold text-base"
              >
                Email
              </AppText>
              <AppText color={theme === "dark" ? "light" : "dark"}>
                {emailHide}@{user?.email.split("@")[1]}
              </AppText>
            </View>
          </View>
          <View
            className={`flex-row justify-between items-center ${theme === "dark" ? `bg-[rgb(83,62,53,0.5)]` : `bg-[rgb(83,62,53,0.1)]`} mt-4 px-4 rounded-lg outline-dashed`}
          >
            <AppText
              color={theme === "dark" ? "light" : "dark"}
              className="font-poppins font-bold text-lg"
            >
              Notification Settings
            </AppText>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={40}
              onPress={() => {
                setModalShown("notification");
                setVisibleModal(true);
              }}
              color={theme === "dark" ? "white" : "black"}
            />
          </View>
          <View className="flex-row justify-between items-center mt-4 px-4 rounded-lg outline-dashed">
            <AppText
              color={theme === "dark" ? "light" : "dark"}
              className="font-poppins font-bold text-lg"
            >
              Appearance
            </AppText>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={40}
              color={theme === "dark" ? "white" : "black"}
              onPress={() => {
                setModalShown("appearance");
                setVisibleModal(true);
              }}
            />
          </View>
          <View className="flex-row justify-between items-center mt-4 px-4 rounded-lg outline-dashed">
            <AppText
              color={theme === "dark" ? "light" : "dark"}
              className="font-poppins font-bold text-lg"
            >
              Help &#x26; Support
            </AppText>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={40}
              color={theme === "dark" ? "white" : "black"}
              onPress={() => {
                setModalShown("helpAndSupport");
                setVisibleModal(true);
              }}
            />
          </View>
          <View
            className={`${theme === "dark" ? `bg-[rgb(83,62,53,0.5)]` : `bg-[rgb(83,62,53,0.1)]`} mt-4 px-4 rounded-lg outline-dashed`}
          >
            <Pressable
              onPress={() => {
                setModalShown("logout");
                setVisibleModal(true);
              }}
              className="flex-row justify-between items-center"
            >
              <AppText
                color={"dark"}
                className="font-poppins font-bold text-lg text-red-600"
              >
                Logout
              </AppText>
              <Ionicons name="exit-outline" size={32} color={"red"} />
            </Pressable>
          </View>
        </View>
        <View
          className={`${theme === "dark" ? `bg-slate-900 border-t-[1px] border-white` : `bg-white`} h-20 flex-row items-center justify-between px-7 pb-2`}
        >
          <View
            className={`mb-14 h-20 w-20 rounded-full ${theme === "dark" ? `bg-gray-900` : `bg-[#E8DFD0]`} items-center justify-center p-1.5`}
          >
            <View
              className={`${theme === "dark" ? `bg-gray-900 border-[1px] border-white` : `bg-white`} h-full w-full rounded-full items-center justify-center`}
            >
              <Feather
                name="menu"
                size={24}
                onPress={() => router.push("/(tabs)/menu")}
                color={theme === "dark" ? "white" : "black"}
              />
            </View>
          </View>
          <Feather
            name="camera"
            size={24}
            onPress={() => router.push("/(camera)")}
            color={theme === "dark" ? "white" : "black"}
          />
          <Entypo
            name="home"
            size={32}
            onPress={() => router.push("/(tabs)")}
            color={theme === "dark" ? "white" : "black"}
          />
          <FontAwesome
            name="arrow-trend-up"
            size={20}
            onPress={() => router.push("/(tabs)/market")}
            color={theme === "dark" ? "white" : "black"}
          />
          <FontAwesome
            name="clock-rotate-left"
            size={20}
            color={theme === "dark" ? "white" : "black"}
          />
        </View>
      </View>
      <Modal
        visible={visibleModal}
        animationType="slide"
        transparent={modalShown === "logout" ? true : false}
      >
        {modalShown === "notification" && (
          <NotificationSettings setVisibleModal={setVisibleModal} />
        )}
        {modalShown === "appearance" && (
          <AppearanceSettings setVisibleModal={setVisibleModal} />
        )}
        {modalShown === "helpAndSupport" && (
          <HelpAndSupport setVisibleModal={setVisibleModal} />
        )}
        {modalShown === "logout" && (
          <Logout setVisibleModal={setVisibleModal} />
        )}
      </Modal>
    </SafeAreaView>
  );
}
