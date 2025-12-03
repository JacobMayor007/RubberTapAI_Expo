import { Profile } from "@/types";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useEffect, useState } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { paymentPost } from "../action/paymentAction";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";
import BackgroundGradient from "./BackgroundGradient";
import Logo from "./Logo";

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
type PaymentMethodProps = {
  choosePlan?: PlanType | null;
  setType: (type: string) => void;
};

const paymentTypes = [
  {
    key: 0,
    title: "GCash",
    image: require("@/assets/images/GCash.png"),
  },
  {
    key: 1,
    title: "Paymaya",
    image: require("@/assets/images/Paymaya.png"),
  },
  {
    key: 2,
    title: "Paypal",
    image: require("@/assets/images/Paypal.png"),
  },
  {
    key: 3,
    title: "Mastercard",
    image: require("@/assets/images/Mastercard.png"),
  },
  {
    key: 4,
    title: "Stripe",
    image: require("@/assets/images/Stripe.png"),
  },
];

export default function PaymentMethod({
  choosePlan,
  setType,
}: PaymentMethodProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [payment, setPayment] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [user?.$id]);

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

  console.log(theme);

  return (
    <ScrollView className={`flex-1`}>
      <BackgroundGradient className="p-6">
        <View className="flex-row items-center gap-4 ">
          <Feather
            onPress={() => setType("checkout")}
            name="arrow-left"
            color={theme === "dark" ? "#E2C282" : "black"}
            size={24}
          />
          <AppText
            className={`text-xl font-poppins font-bold ${theme === "dark" ? `text-[#E2C282]` : `text-[#442111]`}`}
          >
            Checkout
          </AppText>
        </View>
        <View className="mt-6 border-y-[1px] py-7 gap-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-4">
              <Logo className="h-9 w-9" />
              <View>
                <AppText
                  color={theme === "dark" ? `light` : `dark`}
                  className="font-bold text-xl text-[#442111]"
                >
                  {choosePlan?.title} Premium
                </AppText>
                <AppText color={theme === "dark" ? `light` : `dark`}>
                  {choosePlan?.benefits?.benefit_1}
                </AppText>
              </View>
            </View>
            <AppText className="text-[#442111] font-bold">
              <FontAwesome6 name="peso-sign" size={16} />
              {choosePlan?.pricing}/{choosePlan?.period}
            </AppText>
          </View>
          <View className="gap-2">
            <AppText className="text-[#442111] text-sm font-bold font-poppins">
              &#8226; Monthly billing starts at the moment you paid
            </AppText>
            <AppText className="text-[#442111] text-sm font-bold font-poppins">
              &#8226; Please ensure your payment information is up to date to
              avoid any interruption in service.
            </AppText>
          </View>
        </View>
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="text-xl font-bold my-3"
        >
          Payment Method
        </AppText>
        <View>
          {paymentTypes?.map((data) => {
            return (
              <TouchableOpacity
                key={data?.key}
                onPress={() => setPayment(data?.title)}
                className="border-[1px] py-2 flex-row items-center gap-4 px-4"
              >
                {data?.title === payment ? (
                  <View>
                    <Fontisto
                      name="radio-btn-active"
                      color={"#009A1C"}
                      size={22}
                    />
                  </View>
                ) : (
                  <View>
                    <Fontisto
                      name="radio-btn-passive"
                      color={theme === "dark" ? "white" : "black"}
                      size={22}
                    />
                  </View>
                )}

                <View className="gap-2">
                  <AppText
                    color={theme === "dark" ? `light` : `dark`}
                    className="font-bold font-poppins"
                  >
                    {data?.title}
                  </AppText>
                  <Image source={data?.image} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-bold text-xl my-2"
        >
          Summary
        </AppText>
        <View
          className="my-2 bg-black/40 p-6"
          style={{ marginBottom: 20, borderRadius: 6, gap: 12 }}
        >
          <AppText color={`light`}>{choosePlan?.title}</AppText>
          <View className="flex-row items-center justify-between gap-4 border-b-[0.5px] pb-4">
            <View className="flex-row items-center gap-4">
              <Logo className="h-9 w-9" />
              <AppText color={theme === "dark" ? `light` : `dark`}>
                Premium Individual
              </AppText>
            </View>
            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className="font-bold"
            >
              <FontAwesome6 name="peso-sign" size={16} />
              {choosePlan?.pricing}/{choosePlan?.period}
            </AppText>
          </View>
          <View className="flex-row items-center justify-between">
            <AppText color={theme === "dark" ? `light` : `dark`}>
              Total now
            </AppText>
            <AppText color={theme === "dark" ? `light` : `dark`}>
              <FontAwesome6
                name="peso-sign"
                size={16}
                color={theme === "dark" ? `white` : `dark`}
              />
              {choosePlan?.pricing}.00
            </AppText>
          </View>
        </View>
        <TouchableOpacity
          disabled={profile?.subscription ? true : false}
          onPress={async () => {
            setType("paymentMethod");
            await paymentPost(
              user?.$id || "",
              profile?.API_KEY || "",
              choosePlan?.pricing || 0,
              choosePlan?.title || "",
              choosePlan?.period || "",
              choosePlan?.benefits?.benefit_1 || "",
              choosePlan?.benefits?.benefit_2 || "",
              payment
            );
            fetchProfile();
          }}
          style={{
            marginBottom: 64,
          }}
          className="bg-[#75A90A] w-full items-center justify-center py-3 rounded-full"
        >
          <AppText color="light" className="font-bold text-lg">
            {profile?.subscription ? `Subscribed` : `Complete Purchase`}
          </AppText>
        </TouchableOpacity>
      </BackgroundGradient>
    </ScrollView>
  );
}
