import { Profile } from "@/types";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { reportUserFetch } from "../action/reportAction";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";
import BackgroundGradient from "./BackgroundGradient";
import ConfirmCancelModal from "./ConfirmOrCancelModal";

type ReportModalProp = {
  description?: string;
  label?: string;
  setModal: (visible: boolean) => void;
  userId: string;
};

export default function ReportModal({
  description,
  label,
  setModal,
  userId,
}: ReportModalProp) {
  const { theme } = useTheme();
  const [confirmModal, setConfirmModal] = useState(false);
  const [reportUser, setReportUser] = useState<Profile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uri, setUri] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const report = [
    {
      key: 0,
      label: "Harrassment",
      description:
        "Unwanted or threatening messages, bullying, or intimidation.",
    },
    {
      key: 1,
      label: "Pretending to be someone else",
      description:
        "Using another person's name, photos, or identity without permission.",
    },
    {
      key: 2,
      label: "Selling or promoting restricted item",
      description:
        "Attempts to deceive or steal money, personal information, or account details.",
    },

    {
      key: 3,
      label: "Scam or Fraud",
      description:
        "Using another person's name, photos, or identity without permission.",
    },
    {
      key: 4,
      label: "Others",
      description: "",
    },
  ];

  useEffect(() => {
    const getUserId = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/user/${userId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        setReportUser(data);
      } catch (error) {
        console.error(error);
      }
    };

    getUserId();
  }, [userId]);

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

  const pickAnImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("Permission to access camera roll is required!");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        quality: 1,
        aspect: [1, 1],
      });

      if (!result.canceled) {
        const selectedUris = result.assets[0].uri;
        setUri(selectedUris);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const reportHandle = async () => {
    try {
      const result = await reportUserFetch(
        profile?.$id || "",
        profile?.fullName || "",
        profile?.imageURL || "",
        userId,
        reportUser?.fullName || "",
        reportUser?.imageURL || "",
        description || "",
        label || "",
        uri,
        profile?.API_KEY || ""
      );

      if (result.success) {
        Alert.alert("Success", result.message);
        setConfirmModal(false);
      }
    } catch (error) {
      console.error("Report submission failed:", error);
    } finally {
      setConfirmModal(false);
      router.push("/(message)/messages");
    }
  };

  return (
    <BackgroundGradient className="flex-1">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
        scrollEventThrottle={16}
      >
        <View className="">
          <View className={`h-[40%] p-6 relative `}>
            <FontAwesome5
              name="arrow-left"
              size={20}
              color={theme === "dark" ? `#E2C282` : `#010101`}
              onPress={() => setModal(false)}
              style={{
                position: "absolute top-0 left-0",
              }}
            />
            <Image
              source={require("@/assets/images/report.png")}
              className="h-[80%] w-[99%] m-auto"
            />
          </View>
          <View className="p-6">
            <AppText
              className="font-bold font-poppins text-lg"
              color={theme === "dark" ? `light` : `dark`}
            >
              {label}
            </AppText>
            <AppText color={theme === "dark" ? `light` : `dark`}>
              {description}
            </AppText>
          </View>
          <View className="px-6">
            <AppText
              className="font-bold font-poppins text-lg mb-4"
              color={theme === "dark" ? `light` : `dark`}
            >
              Examples of what to report:
            </AppText>
            {report.map((data) => {
              return (
                data?.description !== description &&
                data?.label !== "Others" && (
                  <TouchableOpacity
                    key={data?.key}
                    className="flex-row items-center mb-2 gap-2"
                  >
                    <Entypo name="check" size={20} color={"green"} />
                    <AppText
                      className="font-poppins tracking-wide"
                      color={theme === "dark" ? `light` : `dark`}
                    >
                      {data?.description}
                    </AppText>
                  </TouchableOpacity>
                )
              );
            })}

            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                onPress={pickAnImage}
                className={`border-[6px] ${theme === "dark" && "border-white"} border-dashed h-52 w-1/2 flex-col items-center justify-center gap-4`}
              >
                <FontAwesome5 name="upload" size={40} color="#8F8F8F" />
                <AppText
                  className={`${theme === "dark" ? `bg-slate-600/25` : `bg-[#F09D58]`} text-white font-poppins text-xl px-4 py-2 rounded-full`}
                >
                  Browse Files
                </AppText>
              </TouchableOpacity>
              <View className="flex-row">
                <Image src={uri} width={100} height={208} />
                {uri && (
                  <Feather
                    name="x-circle"
                    onPress={() => setUri("")}
                    size={24}
                    color="red"
                    className="absolute right-0 -top-4"
                  />
                )}
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity
          className={`bg-[#75A90A] m-5 h-12 justify-self-end rounded-lg items-center justify-center`}
          onPress={() => {
            setConfirmModal(true);
          }}
        >
          <AppText className="text-lg font-bold text-white">
            Submit Report
          </AppText>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={confirmModal}
        onRequestClose={() => setConfirmModal(false)}
        transparent
      >
        <ConfirmCancelModal
          padding={20}
          blurIntensity={20}
          heightSize={48}
          borderRounded={10}
          onCancel={() => setConfirmModal(false)}
          onClose={() => setConfirmModal(false)}
          onOk={reportHandle}
        >
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="font-bold font-poppins"
          >
            Confirming report on user{" "}
            <AppText
              className="capitalize"
              color={theme === "dark" ? `light` : `dark`}
            >
              {reportUser?.username}
            </AppText>
          </AppText>
        </ConfirmCancelModal>
      </Modal>
    </BackgroundGradient>
  );
}
