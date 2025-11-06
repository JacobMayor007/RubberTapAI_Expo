import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";
import BackgroundGradient from "./BackgroundGradient";

type HelpAndSupportProps = {
  setVisibleModal: (visible: boolean) => void;
};

const HelpAndSupport = ({ setVisibleModal }: HelpAndSupportProps) => {
  const { theme } = useTheme();
  const [choice, setChoice] = useState("FAQ");

  return (
    <BackgroundGradient className={`flex-1 `}>
      <ScrollView>
        <View className="flex-row items-center gap-4 p-6">
          <FontAwesome5
            name="arrow-left"
            size={24}
            onPress={() => setVisibleModal(false)}
            color={theme === "dark" ? `white` : `black`}
          />
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="text-2xl font-bold"
          >
            Help And Support
          </AppText>
        </View>
        <View className=" flex-row items-center ">
          <Text
            onPress={() => setChoice("FAQ")}
            style={{
              borderBottomWidth: 2,
            }}
            className={`${choice === "FAQ" ? `border-black` : `border-gray-500`} w-1/2 ${theme === "dark" ? `text-[#E2C282]` : `text-black`} text-center  text-xl font-poppins font-bold`}
          >
            FAQs
          </Text>
          <Text
            onPress={() => setChoice("TandC")}
            style={{
              borderBottomWidth: 2,
            }}
            className={`${choice === "TandC" ? `border-black` : `border-gray-500`} ${theme === "dark" ? `text-[#E2C282]` : `text-black`} text-center w-1/2   text-xl font-poppins font-bold`}
          >
            Terms & Conditions
          </Text>
        </View>
        <View>
          {choice === "TandC" && <TermsAndConditions />}
          {choice === "FAQ" && <FrequentlyAskedQuestions />}
        </View>
      </ScrollView>
    </BackgroundGradient>
  );
};

export default HelpAndSupport;

function TermsAndConditions() {
  const { theme } = useTheme();

  return (
    <View className="flex-1 p-6">
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="text-xl font-bold font-poppins mb-4"
      >
        Terms And Conditions
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins font-medium tracking-widest leading-10 text-base "
      >
        Welcome to{" "}
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins font-bold text-justify"
        >
          RubberTapAI
        </AppText>
        , an AI-powered assistant designed to support rubber tappers, farmers,
        and stakeholders in making better tapping decisions, detecting tree
        diseases, adapting to weather, and trading rubber products efficiently.
        By accessing or using the RubberTapAI mobile application (“App”), you
        agree to be bound by these Terms and Conditions (“Terms”). If you do not
        agree, do not use the App.
      </AppText>
      <View className="flex-col gap-1">
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins font-bold "
        >
          1. Use of the Application
        </AppText>
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins  "
        >
          RubberTapAI grants you a non-exclusive, non-transferable, and limited
          license to use the App for personal or commercial rubber-tapping
          purposes only. You agree not to:
        </AppText>
        <AppText color={theme === "dark" ? `light` : `dark`}>
          {`\u2022`} Use the app for any illegal or unauthorized purpose.
        </AppText>
        <AppText color={theme === "dark" ? `light` : `dark`}>
          {`\u2022`} Reverse engineer, copy, modify, or distribute any part of
          the App.
        </AppText>
        <AppText color={theme === "dark" ? `light` : `dark`}>
          {`\u2022`} Use the AI features to harm rubber trees intentionally or
          mislead others.
        </AppText>
      </View>
      <View className="flex-col gap-1">
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins font-bold "
        >
          2. Account Registration
        </AppText>
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins  "
        >
          To access most features, you must register an account. You agree to:
        </AppText>
        <AppText color={theme === "dark" ? `light` : `dark`}>
          {`\u2022`} Provide accurate and complete information.
        </AppText>
        <AppText color={theme === "dark" ? `light` : `dark`}>
          {`\u2022`} Maintain the confidentiality of your credentials.
        </AppText>
        <AppText color={theme === "dark" ? `light` : `dark`}>
          {`\u2022`} Be responsible for all activity under your account.
        </AppText>
      </View>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins font-bold "
      >
        3. Data Collection and Privacy
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins  leading-6"
      >
        We collect certain information such as images, weather data, tapping
        schedules, and GPS location to provide you with customized AI guidance
        and analytics.
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins font-bold "
      >
        4. AI Guidance Disclaimer
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins leading-6"
      >
        The information provided by RubberTapAI (e.g., tapping instructions,
        weather forecasts, disease alerts) is based on AI models and third-party
        data. While we strive for accuracy, the guidance may not always reflect
        actual conditions. We are not responsible for any losses or damages
        caused by reliance on the app’s recommendations.
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins font-bold "
      >
        5. Rubber Waste Trading & Marketplace
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins leading-6"
      >
        Users can list, buy, or sell rubber waste through our marketplace. We do
        not guarantee the performance, payment, or delivery of items. All
        negotiations are between users. Use caution and verify buyer/seller
        legitimacy.
      </AppText>
      <View className="flex-col gap-1">
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins font-bold "
        >
          6. Prohibited Conduct
        </AppText>
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins  "
        >
          You agree not to:
        </AppText>
        <AppText color={theme === "dark" ? `light` : `dark`}>
          {`\u2022`} Upload false or misleading content.
        </AppText>
        <AppText color={theme === "dark" ? `light` : `dark`}>
          {`\u2022`} Violate the intellectual property rights of others.
        </AppText>
        <AppText color={theme === "dark" ? `light` : `dark`}>
          {`\u2022`} Use the app to harass, spam, or exploit others.
        </AppText>
      </View>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins font-bold "
      >
        7. Intellectual Property{" "}
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins leading-6 "
      >
        All content, logos, code, and designs in RubberTapAI are the property of
        the development team. You may not use them without written permission.
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins font-bold "
      >
        8. Modifications and Updates{" "}
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins leading-6 "
      >
        We may update or modify the app and these Terms at any time. Continued
        use after updates constitutes acceptance of the changes.
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins font-bold "
      >
        9. Termination{" "}
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins leading-6 "
      >
        We reserve the right to suspend or terminate your account without notice
        if you violate these Terms.
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins font-bold "
      >
        10. Limitation of Liability{" "}
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins leading-6 "
      >
        RubberTapAI is provided “as is.” We do not guarantee that the App will
        be error-free or uninterrupted. We are not liable for any direct or
        indirect damages arising from your use of the App.
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins font-bold "
      >
        11. Governing Law{" "}
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins leading-6 "
      >
        These Terms are governed by the laws of the Philippines. Any disputes
        shall be resolved in the appropriate courts of Cebu City.
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins font-bold "
      >
        12. Contact Information{" "}
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins leading-6 "
      >
        If you have any questions or concerns, contact us at:
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins leading-6 "
      >
        Louie Albert Canen – louiealbertcanen2@gmail.com{" "}
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins leading-6 "
      >
        Aiken Artigas – aiken.artigas38@gmail.com{" "}
      </AppText>
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins leading-6 "
      >
        Jacob Mary Tapere – jacobmary.tapere007@gmail.com{" "}
      </AppText>
    </View>
  );
}

const questions = [
  {
    key: 0,
    label: "General",
    value: 1,
  },
  {
    key: 1,
    label: "Account",
    value: 2,
  },
  {
    key: 2,
    label: "History Logs",
    value: 3,
  },
  {
    key: 3,
    label: "Products",
    value: 4,
  },
];

function FrequentlyAskedQuestions() {
  const { theme } = useTheme();
  const [choice, setChoice] = useState(0);

  return (
    <View className="flex-1 p-6">
      <ScrollView
        contentContainerStyle={{
          flexDirection: "row",
          gap: 12,
          paddingBottom: 20,
        }}
        horizontal
      >
        {questions.map((data, index) => {
          return (
            <Pressable
              key={data.key}
              className={`${choice === index ? `bg-[#75A90A]` : `bg-transparent`} border-[1px] border-[#3F1F11] px-5 py-2 rounded-full`}
              onPress={() => setChoice(index)}
            >
              <AppText color={theme === "dark" ? `light` : `dark`}>
                {data?.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
      {choice === 0 && <General />}
      {choice === 1 && <Account />}
      {choice === 2 && <HistoryLogs />}
      {choice === 3 && <Products />}
    </View>
  );
}

const general = [
  {
    title: "How do I manage my notifications?",
    label:
      "To manage notifications, go to “Menu”, select “Notification Settings,” and customize your preferences.",
  },
  {
    title: "How do I update my full name?",
    label:
      "To update your full name, simply go to the “Menu” click Edit” button. Input your new name",
  },
  {
    title: "How to switch in dark mode?",
    label:
      "To switch into dark mode, go to “Menu” tabs and click the “Appearance Settings.” ",
  },
];

function General() {
  const [choice, setChoice] = useState("");
  const { theme } = useTheme();

  return (
    <View className="gap-4">
      {general.map((data, index) => {
        return (
          <Pressable
            onPress={() => setChoice(data?.title === choice ? "" : data?.title)}
            key={index}
            className="gap-5 rounded-xl bg-[#75A90A]/50 p-6"
          >
            <View className="flex-row items-center justify-between">
              <AppText
                className={`text-lg font-bold ${theme === "dark" ? `text-[#E2C282]` : `text-[#533E35]`}`}
              >
                {data?.title}
              </AppText>
              <AntDesign
                name={choice === data.title ? `caretup` : `caretdown`}
              />
            </View>
            {choice === data.title && (
              <AppText
                className={`text-base  ${theme === "dark" ? `text-[#E2C282]` : `text-[#533E35]`}`}
              >
                {data?.label}
              </AppText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const account = [
  {
    title: "How to change your password",
    label:
      "To change you password, simply go to “Menu” click the “Edit” button, and click the “Change Password” button. Input your old password, and your new password",
  },
  {
    title: "How to change your profile picture",
    label:
      "To change you profile picture, simply go to “Menu” click the “Edit” button, and click the “pencil” icon, and choose your photo.",
  },
  {
    title: "How to change your email address",
    label:
      "To change your email address simply go to “Menu” click the “Edit” button, and input your new email, press the check mark. After that, we will send you an email for verification",
  },
];

function Account() {
  const [choice, setChoice] = useState("");
  const { theme } = useTheme();

  return (
    <View className="gap-4">
      {account.map((data, index) => {
        return (
          <Pressable
            onPress={() => setChoice(data?.title === choice ? "" : data?.title)}
            key={index}
            className="gap-5 rounded-xl bg-[#75A90A]/50 p-6"
          >
            <View className="flex-row items-center justify-between">
              <AppText
                className={`text-lg font-bold ${theme === "dark" ? `text-[#E2C282]` : `text-[#533E35]`}`}
              >
                {data?.title}
              </AppText>
              <AntDesign
                name={choice === data.title ? `caretup` : `caretdown`}
              />
            </View>
            {choice === data.title && (
              <AppText
                className={`text-base  ${theme === "dark" ? `text-[#E2C282]` : `text-[#533E35]`}`}
              >
                {data?.label}
              </AppText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const historyLogs = [
  {
    title: "What is the use of History Logs?",
    label:
      "The History Logs tab helps you keep track of all your captured leaves. Each leaf is automatically linked to its tree and plot, making it easy to monitor your farm’s growth and leaf health over time.",
  },
  {
    title: "How to use History Logs?",
    label:
      "To use the History Logs, start by adding your plots and the trees within them. When you capture leaves, they will automatically be saved under the correct tree and plot, allowing you to view and manage all your records easily.",
  },
  {
    title: "Can I view past records?",
    label:
      "Yes, you can view all your previous leaf captures in the History Logs section. Each entry shows which tree and plot it belongs to, helping you track changes and progress over time.",
  },
  {
    title: "Can I update or delete logs?",
    label:
      "If you need to make changes, you can edit or delete specific entries from your History Logs. This ensures your farm data stays accurate and up to date.",
  },
];

function HistoryLogs() {
  const [choice, setChoice] = useState("");
  const { theme } = useTheme();
  return (
    <View className="gap-4">
      {historyLogs.map((data, index) => {
        return (
          <Pressable
            onPress={() => setChoice(data?.title === choice ? "" : data?.title)}
            key={index}
            className="gap-5 rounded-xl bg-[#75A90A]/50 p-6"
          >
            <View className="flex-row items-center justify-between">
              <AppText
                className={`text-lg font-bold ${theme === "dark" ? `text-[#E2C282]` : `text-[#533E35]`}`}
              >
                {data?.title}
              </AppText>
              <AntDesign
                name={choice === data.title ? `caretup` : `caretdown`}
              />
            </View>
            {choice === data.title && (
              <AppText
                className={`text-base  ${theme === "dark" ? `text-[#E2C282]` : `text-[#533E35]`}`}
              >
                {data?.label}
              </AppText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const products = [
  {
    title: "Why can't I add products?",
    label:
      "You cannot add products because your email address has not been verified yet. Please check your inbox and verify your email to enable this feature.",
  },
  {
    title: "Can I edit my products?",
    label:
      "Yes, you can edit your products anytime. Simply go to the “Market” tab press the “View Details”, select the item you want to update, and press the “Update” button, and make the necessary changes.",
  },
  {
    title: "What is the use of the Rubber Price above?",
    label:
      "The Rubber Price section shows the live market price of rubber. This helps farmers stay informed about the current value of rubber, make smarter selling decisions, and maximize their profits based on real-time market trends.",
  },
];

function Products() {
  const [choice, setChoice] = useState("");
  const { theme } = useTheme();
  return (
    <View className="gap-4">
      {products.map((data, index) => {
        return (
          <Pressable
            onPress={() => setChoice(data?.title === choice ? "" : data?.title)}
            key={index}
            className="gap-5 rounded-xl bg-[#75A90A]/50 p-6"
          >
            <View className="flex-row items-center justify-between">
              <AppText
                className={`text-lg font-bold ${theme === "dark" ? `text-[#E2C282]` : `text-[#533E35]`}`}
              >
                {data?.title}
              </AppText>
              <AntDesign
                name={choice === data.title ? `caretup` : `caretdown`}
              />
            </View>
            {choice === data.title && (
              <AppText
                className={`text-base  ${theme === "dark" ? `text-[#E2C282]` : `text-[#533E35]`}`}
              >
                {data?.label}
              </AppText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
