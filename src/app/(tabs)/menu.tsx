import AppearanceSettings from "@/src/components/AppearanceSettings";
import { AppText } from "@/src/components/AppText";
import EditProfile from "@/src/components/EditProfile";
import HelpAndSupport from "@/src/components/HelpAndSupport";
import Logo from "@/src/components/Logo";
import Logout from "@/src/components/Logout";
import NavigationBar from "@/src/components/Navigation";
import NotificationSettings from "@/src/components/NotificationSettings";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Profile } from "@/types";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Modal, Pressable, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Menu() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [emailHide, setEmailHide] = useState("");
  const [visibleModal, setVisibleModal] = useState(false);
  const [modalShown, setModalShown] = useState("");

  const { theme } = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/user/${user?.$id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Upload error:", error);
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
                  src={`${profile?.imageURL}`}
                />
                <AppText
                  color={theme === "dark" ? "light" : "dark"}
                  className="font-poppins font-bold text-lg pt-4 text-ellipsis text-nowrap whitespace-nowrap"
                >
                  {profile?.fullName}
                </AppText>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setVisibleModal(true);
                  setModalShown("editProfile");
                }}
                className={`${theme !== "dark" ? `bg-[#75A90A]` : `bg-gray-600`} h-7 w-16 justify-center items-center rounded-full`}
              >
                <AppText color={`light`}>Edit</AppText>
              </TouchableOpacity>
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
                {profile?.fullName}
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
        <NavigationBar active="menu" />
      </View>
      <Modal
        visible={visibleModal}
        animationType="slide"
        transparent={modalShown === "logout" ? true : false}
        onRequestClose={() => setVisibleModal(false)}
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
        {modalShown === "editProfile" && (
          <EditProfile setVisibleModal={setVisibleModal} />
        )}
      </Modal>
    </SafeAreaView>
  );
}
