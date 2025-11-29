import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image, TouchableOpacity, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";
import Logo from "./Logo";

type CheckoutProps = {
  choosePlan?: PlanType | null;
  setType: (type: string) => void;
  setModal: (visible: boolean) => void;
};

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

export default function CheckoutPlan({
  choosePlan,
  setType,
  setModal,
}: CheckoutProps) {
  const { theme } = useTheme();

  console.log("Checkout", choosePlan);

  return (
    <View
      className={`flex-1 ${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`}  p-6`}
    >
      <View className="flex-row items-center gap-4">
        <Feather
          color={theme === "dark" ? `#E8C282` : `dark`}
          onPress={() => setModal(false)}
          name="arrow-left"
          size={24}
        />
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="text-2xl font-bold font-poppins"
        >
          Checkout
        </AppText>
      </View>
      <View
        className={`mt-9 border-y-[1px] ${theme === "dark" ? `border-[#E8C282]` : `border-black`} py-9 gap-4`}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-4">
            <Logo className="h-9 w-9" />
            <View>
              <AppText
                className={`font-bold text-xl ${theme === "dark" ? `text-[#E8C282]` : `text-[#442111]`}`}
              >
                {choosePlan?.title} Premium
              </AppText>
              <AppText color={theme === "dark" ? `light` : `dark`}>
                {choosePlan?.benefits?.benefit_1}
              </AppText>
            </View>
          </View>
          <AppText
            className={`font-bold text-xl ${theme === "dark" ? `text-[#E8C282]` : `text-[#442111]`}`}
          >
            <FontAwesome6 name="peso-sign" size={16} />
            {choosePlan?.pricing}/{choosePlan?.period}
          </AppText>
        </View>
        <View className="gap-2">
          <AppText
            className={`${theme === "dark" ? `text-[#E8C282]` : `text-[#442111]`} text-sm font-bold font-poppins`}
          >
            &#8226; Monthly billing starts at the moment you paid
          </AppText>
          <AppText
            className={`${theme === "dark" ? `text-[#E8C282]` : `text-[#442111]`} text-sm font-bold font-poppins`}
          >
            &#8226; Please ensure your payment information is up to date to
            avoid any interruption in service.
          </AppText>
        </View>
      </View>
      <View className="mt-7">
        <AppText
          className={`font-bold font-poppins text-xl ${theme === "dark" ? `text-[#E8C282]` : `text-[#442111]`}`}
        >
          Choose how to pay
        </AppText>
        <View
          className="items-center"
          style={{
            boxShadow:
              "4px 4px 1px 0px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.19)",
            gap: 20,
            paddingVertical: 12,
            borderRadius: 8,
            paddingHorizontal: 24,
          }}
        >
          <AppText
            className={`font-bold font-poppins text-[10px]  ${theme === "dark" ? `text-[#E8C282]` : `text-[#442111]`}`}
          >
            Pay through RubbertapAI with any supported payment method.
          </AppText>
          <View className="flex-row items-center gap-2">
            {paymentTypes?.map((data) => {
              return <Image key={data?.key} source={data?.image} />;
            })}
          </View>
          <TouchableOpacity
            onPress={() => {
              setType("paymentMethod");
            }}
            className={` bg-[#75A90A] w-full items-center justify-center py-2 rounded-full`}
          >
            <AppText className={`text-white`}>Continue</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
