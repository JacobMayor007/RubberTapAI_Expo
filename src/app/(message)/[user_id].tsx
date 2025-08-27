import { AppText } from "@/src/components/AppText";
import ReportModal from "@/src/components/ReportModal";
import { useTheme } from "@/src/contexts/ThemeContext";
import Feather from "@expo/vector-icons/Feather";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Report() {
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [modal, setModal] = useState(false);

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

  console.log("Report: ", params.user_id);

  return (
    <SafeAreaView className="flex-1">
      <View className={`flex-1 bg-[#FFECCC] p-6`}>
        <Feather name="x" size={28} onPress={() => router.back()} />
        <AppText
          className="font-poppins font-bold text-xl mt-4"
          color={theme === "dark" ? `light` : `dark`}
        >
          Select a problem to report
        </AppText>
        <AppText
          className="font-poppins mt-1 font-medium mb-5"
          color={theme === "dark" ? `light` : `dark`}
        >
          We won&#39;t let the person know who reported them.
        </AppText>

        {report?.map((data) => {
          return (
            <TouchableOpacity
              onPress={() => {
                setModal(true);
                setLabel(data?.label);
                setDescription(data?.description);
              }}
              key={data?.key}
              className="flex-col mb-4"
            >
              <AppText
                color={theme === "dark" ? `light` : `dark`}
                className="font-poppins font-bold text-lg"
              >
                {data?.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
      <Modal
        visible={modal}
        onRequestClose={() => setModal(false)}
        animationType="slide"
      >
        <ReportModal
          description={description}
          label={label}
          userId={String(params?.user_id)}
          setModal={setModal}
        />
      </Modal>
    </SafeAreaView>
  );
}
