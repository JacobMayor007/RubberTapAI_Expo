import { Profile } from "@/types";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useEffect, useState } from "react";
import { Alert, Image, Modal, TouchableOpacity, View } from "react-native";
import { reportUserFetch } from "../action/reportAction";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";
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
  const { user } = useAuth();

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

  const reportHandle = async () => {
    try {
      const result = await reportUserFetch(
        userId,
        user?.$id || "",
        label || "",
        description || ""
      );

      // Handle successful response
      if (result.success) {
        Alert.alert("Success", result.message);
        setConfirmModal(false);
      }
    } catch (error) {
      // Errors are already handled in reportUserFetch
      console.error("Report submission failed:", error);
    } finally {
      setConfirmModal(false);
    }
  };

  console.log(label, description, userId, user?.$id);

  return (
    <View className="flex-1 bg-[#FFECCC] justify-between">
      <View className="">
        <View className="h-[40%] bg-[#EFDEC1] p-6 relative ">
          <FontAwesome5
            name="arrow-left"
            size={20}
            onPress={() => setModal(false)}
            style={{
              position: "absolute top-0 left-0",
            }}
          />
          <Image
            source={require("@/assets/images/report.png")}
            className="h-[90%] w-[74%] m-auto"
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
        </View>
      </View>
      <TouchableOpacity
        className={`${theme === "dark" ? `bg-gray-900` : `bg-[#75A90A]`} m-5 h-12 justify-self-end rounded-lg items-center justify-center`}
        onPress={() => {
          setConfirmModal(true);
        }}
      >
        <AppText className="text-lg font-bold">Submit Report</AppText>
      </TouchableOpacity>
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
    </View>
  );
}
