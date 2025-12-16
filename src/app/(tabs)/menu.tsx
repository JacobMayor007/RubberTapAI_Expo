import { rateRubberTapAI } from "@/src/action/userAction";
import AppearanceSettings from "@/src/components/AppearanceSettings";
import { AppText } from "@/src/components/AppText";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import ConfirmCancelModal from "@/src/components/ConfirmOrCancelModal";
import EditProfile from "@/src/components/EditProfile";
import HeaderNav from "@/src/components/HeaderNav";
import HelpAndSupport from "@/src/components/HelpAndSupport";
import Loading from "@/src/components/LoadingComponent";
import Logout from "@/src/components/Logout";
import NavigationBar from "@/src/components/Navigation";
import NotificationSettings from "@/src/components/NotificationSettings";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useWeather } from "@/src/contexts/WeatherContext";
import { globalFunction } from "@/src/global/fetchWithTimeout";
import { AppRate, Profile } from "@/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Menu() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [emailHide, setEmailHide] = useState("");
  const [visibleModal, setVisibleModal] = useState(false);
  const [modalShown, setModalShown] = useState("");
  const { rain } = useWeather();
  const [rate, setRate] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [userRated, setUserRated] = useState<AppRate | null>(null);
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
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

  useEffect(() => {
    const isUserRate = async () => {
      try {
        const response = await globalFunction.fetchWithTimeout(
          `${process.env.EXPO_PUBLIC_BASE_URL}/rubbertapai/${user?.$id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          },
          25000
        );

        const data = await response.json();
        setUserRated(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    isUserRate();
  }, [profile]);

  const fetchUserRatingStatus = async () => {
    try {
      const response = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/rubbertapai/${profile?.$id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
        25000
      );

      const data = await response.json();
      setUserRated(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRateApp = async (
    userId: string,
    rating: number,
    feedback: string,
    API_KEY: string
  ) => {
    try {
      if (!rating || !feedback.trim()) {
        Alert.alert(
          "Missing Information",
          "Please provide both a rating and written feedback before submitting."
        );
        return;
      }

      await rateRubberTapAI(userId, rating, feedback, API_KEY);

      Alert.alert(
        "Your feedback has submitted",
        "Thank you for your valuable feedback. We’ll use it to improve the experience.",
        [
          {
            style: "default",
            text: "Ok",
            onPress: async () => {
              await fetchUserRatingStatus();
            },
          },
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Something went wrong on our end. Can you please try again? Thank you!"
      );
    } finally {
      setVisibleModal(false);
      setModalShown("");
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <BackgroundGradient className="flex-1 items-center justify-center">
          <Loading className="h-16 w-16 my-auto" />
        </BackgroundGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <BackgroundGradient
        className={`${
          theme === "dark" ? `bg-gray-900` : `bg-[#FFDFA9]`
        } flex-1 flex-col justify-between`}
      >
        <View className={` flex-1 px-6 flex-col z-20`}>
          <HeaderNav title="Settings" arrow={true} />
          <View className={`h-72 rounded-2xl drop-shadow-lg `}>
            <LinearGradient
              colors={
                theme === "dark"
                  ? ["#202020", "#1B1B1B"]
                  : rain
                  ? ["#7BDEE0", "#F1FDDA"]
                  : ["#BFE07B", "#79B400"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 0.33, y: 1 }}
              style={{ borderRadius: 10, padding: 16 }}
              className="h-64 "
            >
              <View className="flex-row justify-between items-center px-4 mt-6">
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
                  className={`bg-[#75A90A]  h-9 w-20 justify-center items-center rounded-full`}
                >
                  <AppText className={`text-white`}>Edit</AppText>
                </TouchableOpacity>
              </View>
              <View
                className={`"flex-1 ${
                  theme === "dark" ? `bg-gray-900` : ``
                } mx-4 mt-8 gap-1.5 rounded-xl drop-shadow-2xl flex-col py-2 px-4 gap-1"`}
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
            </LinearGradient>
          </View>
          <View
            className={`flex-row justify-between items-center ${
              theme === "dark"
                ? `bg-[rgb(83,62,53,0.5)]`
                : `bg-[rgb(83,62,53,0.1)]`
            } mt-4 px-4 rounded-lg outline-dashed`}
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
          {!userRated?.$id && (
            <View
              className={`${
                theme === "dark" ? "bg-green-500/80" : "bg-green-500/20 "
              } mt-4 px-4 rounded-lg outline-dashed py-2`}
            >
              <Pressable
                onPress={() => {
                  setModalShown("rate");
                  setVisibleModal(true);
                }}
                className="flex-row justify-between items-center"
              >
                <AppText
                  className={`font-poppins font-bold text-lg ${
                    theme === "dark" ? `text-white` : `text-black`
                  }`}
                >
                  Rate App
                </AppText>
                <Ionicons
                  name="star-outline"
                  size={32}
                  color={theme === "dark" ? `white` : `#15803d`}
                />
              </Pressable>
            </View>
          )}

          <View
            className={`${
              theme === "dark"
                ? `bg-[rgb(83,62,53,0.5)]`
                : `bg-[rgb(83,62,53,0.1)]`
            } py-2 mt-4 px-4 rounded-lg outline-dashed`}
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
      </BackgroundGradient>
      <Modal
        visible={visibleModal}
        animationType="slide"
        transparent={
          modalShown === "logout" || modalShown === "rate" ? true : false
        }
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
        {modalShown === "rate" && (
          <ConfirmCancelModal
            heightSize={120}
            padding={12}
            blurIntensity={50}
            borderRounded={12}
            onClose={() => setVisibleModal(false)}
            onCancel={() => setVisibleModal(false)}
            onOk={async () => {
              await handleRateApp(
                profile?.$id || "",
                rate,
                feedback,
                profile?.API_KEY || ""
              );
              setVisibleModal(false);
            }}
          >
            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className="font-bold font-poppins text-sm mt-4 ml-10"
            >
              Enjoying the app? Give us a quick rating!
            </AppText>
            <View className="flex-col  my-auto px-5 w-full pb-10 gap-4">
              <View className=" flex-row items-center justify-center gap-4 pl-5">
                <AntDesign
                  name="star"
                  onPress={() => setRate(1)}
                  size={32}
                  color={rate > 0 ? "#fadb14" : theme === "dark" ? `white` : ""}
                />
                <AntDesign
                  name="star"
                  onPress={() => setRate(2)}
                  size={32}
                  color={rate > 1 ? "#fadb14" : theme === "dark" ? `white` : ""}
                />
                <AntDesign
                  name="star"
                  onPress={() => setRate(3)}
                  size={32}
                  color={rate > 2 ? "#fadb14" : theme === "dark" ? `white` : ""}
                />
                <AntDesign
                  name="star"
                  onPress={() => setRate(4)}
                  size={32}
                  color={rate > 3 ? "#fadb14" : theme === "dark" ? `white` : ""}
                />
                <AntDesign
                  name="star"
                  onPress={() => setRate(5)}
                  size={32}
                  color={rate > 4 ? "#fadb14" : theme === "dark" ? `white` : ""}
                />
              </View>
              <TextInput
                multiline
                placeholder="(Required)"
                textAlignVertical="top"
                value={feedback}
                onChangeText={setFeedback}
                placeholderTextColor="#6b7280"
                className={`border-[1px] ${
                  theme === "dark" ? `text-[#E8C282]` : `text-slate-800`
                } p-4 border-gray-500 h-28 w-full rounded-lg`}
              />
              <View className="w-full ">
                <AppText className="font-bold font-poppins text-start  text-xs text-slate-500">
                  {`(${feedback.length}/1500)`}
                </AppText>
              </View>
            </View>
          </ConfirmCancelModal>
        )}
      </Modal>
    </SafeAreaView>
  );
}
