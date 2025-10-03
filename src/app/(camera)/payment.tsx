import { AppText } from "@/src/components/AppText";
import CheckoutPlan from "@/src/components/CheckoutPlan";
import Loading from "@/src/components/LoadingComponent";
import PaymentMethod from "@/src/components/PaymentMethod";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Profile } from "@/types";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PlanType = {
  key?: number;
  title?: string;
  pricing?: number;
  period?: string;
  benefits?: {
    benefit_1?: string;
    benefit_2?: string;
  };
};

export default function Payment() {
  const { theme } = useTheme();
  const [modal, setModal] = useState(false);
  const [type, setType] = useState("");
  const [choosePlan, setChoosePlan] = useState<PlanType | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const plan = [
    {
      key: 0,
      title: "Free",
      pricing: 0,
      period: "Life",
      benefits: {
        benefit_1: "Limit to 25 captures per day",
        benefit_2: "Adds",
      },
    },
    {
      key: 1,
      title: "Basic",
      pricing: 49,
      period: "Weekly",
      benefits: {
        benefit_1: "Unlimited Photo Capture",
        benefit_2: "No adds",
      },
    },
    {
      key: 2,
      title: "Pro",
      pricing: 99,
      period: "Monthly",
      benefits: {
        benefit_1: "Unlimited Photo Capture",
        benefit_2: "No adds",
      },
    },
    {
      key: 3,
      title: "Enterprise",
      pricing: 699,
      period: "Yearly",
      benefits: {
        benefit_1: "Unlimited Photo Capture",
        benefit_2: "No adds",
      },
    },
  ];

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
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.$id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FFECCC] items-center justify-center">
        <Loading className="h-20 w-20" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        className={`flex-1 ${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} p-6`}
      >
        <View className="flex-row items-center gap-4">
          <Feather onPress={() => router.back()} name="arrow-left" size={24} />
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="font-poppins font-bold text-2xl"
          >
            Subscription
          </AppText>
        </View>
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins text-lg mt-4"
        >
          Select Plan
        </AppText>

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            borderColor: "black",
            paddingHorizontal: 4,
            paddingVertical: 8,
            marginTop: 10,
            flexDirection: "column",
          }}
        >
          {plan?.map((data) => {
            return (
              <View
                className="h-72 rounded-lg my-4 p-6"
                key={data?.key}
                style={{
                  boxShadow:
                    "4px 2px 1px 0px rgba(0, 0, 0, 0.3), 2px 6px 20px 2px rgba(0, 0, 0, 0.19)",
                }}
              >
                <View className="flex-row items-center justify-between ">
                  <View className="flex-row items-center gap-2">
                    <Image
                      source={require("@/assets/images/Logo.png")}
                      className="h-9 w-9"
                    />
                    <AppText
                      color={theme === "dark" ? `light` : `dark`}
                      className="font-poppins text-sm font-bold"
                    >
                      Premium
                    </AppText>
                  </View>
                  {data?.title === "Free" && !profile?.subscription && (
                    <AppText className="bg-[#75A90A] p-2 rounded-md">
                      Your current plan
                    </AppText>
                  )}
                </View>
                <AppText
                  color={theme === "dark" ? `light` : `dark`}
                  className="font-poppins font-bold text-xl my-2"
                >
                  {data?.title}
                </AppText>
                <AppText
                  className="flex-row items-center font-poppins font-bold text-[#442111]"
                  color={theme === "dark" ? `light` : `dark`}
                >
                  <FontAwesome6 name={"peso-sign"} color={"#442111"} />{" "}
                  {data?.pricing} / {data?.period}
                </AppText>

                <View className="h-[0.5px] bg-gray-600 rounded-full my-4" />

                <AppText
                  className="font-bold my-0.5"
                  color={theme === "dark" ? `light` : `dark`}
                >
                  &#x2022; {data?.benefits.benefit_1}
                </AppText>
                <AppText color={theme === "dark" ? `light` : `dark`}>
                  {data?.benefits.benefit_2 && (
                    <AppText color={theme === "dark" ? `light` : `dark`}>
                      &#x2022;
                    </AppText>
                  )}{" "}
                  {data?.benefits.benefit_2}
                </AppText>
                {data?.title !== "Free" && (
                  <TouchableOpacity
                    onPress={() => {
                      setModal(true);
                      setType("checkout");
                      setChoosePlan(data);
                    }}
                    style={{
                      boxShadow:
                        "1px 2px 1px 0px rgba(0, 0, 0, 0.3), 1px 2px 0px 2px rgba(0, 0, 0, 0.19)",
                    }}
                    className="h-9 rounded-full items-center justify-center bg-[#75A90A] my-5"
                  >
                    <AppText color={`light`}>Get Premium Individual</AppText>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
      <Modal
        visible={modal}
        onRequestClose={() => setModal(false)}
        animationType="slide"
      >
        {type === "checkout" ? (
          <CheckoutPlan
            choosePlan={choosePlan}
            setType={setType}
            setModal={setModal}
          />
        ) : (
          <PaymentMethod choosePlan={choosePlan} setType={setType} />
        )}
      </Modal>
    </SafeAreaView>
  );
}
