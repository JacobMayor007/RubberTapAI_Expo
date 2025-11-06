import Feather from "@expo/vector-icons/Feather";
import { ScrollView, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";
import BackgroundGradient from "./BackgroundGradient";

type TermsAndConditionsProps = {
  setModal: (visible: boolean) => void;
};

export default function TermsAndCon({ setModal }: TermsAndConditionsProps) {
  const { theme } = useTheme();
  return (
    <View className="flex-1">
      <BackgroundGradient>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            gap: 6,
          }}
        >
          <Feather
            name="arrow-left"
            size={32}
            onPress={() => setModal(false)}
            style={{
              marginBottom: 16,
            }}
          />

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
            , an AI-powered assistant designed to support rubber tappers,
            farmers, and stakeholders in making better tapping decisions,
            detecting tree diseases, adapting to weather, and trading rubber
            products efficiently. By accessing or using the RubberTapAI mobile
            application (“App”), you agree to be bound by these Terms and
            Conditions (“Terms”). If you do not agree, do not use the App.
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
              RubberTapAI grants you a non-exclusive, non-transferable, and
              limited license to use the App for personal or commercial
              rubber-tapping purposes only. You agree not to:
            </AppText>
            <AppText color={theme === "dark" ? `light` : `dark`}>
              {`\u2022`} Use the app for any illegal or unauthorized purpose.
            </AppText>
            <AppText color={theme === "dark" ? `light` : `dark`}>
              {`\u2022`} Reverse engineer, copy, modify, or distribute any part
              of the App.
            </AppText>
            <AppText color={theme === "dark" ? `light` : `dark`}>
              {`\u2022`} Use the AI features to harm rubber trees intentionally
              or mislead others.
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
              To access most features, you must register an account. You agree
              to:
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
            schedules, and GPS location to provide you with customized AI
            guidance and analytics.
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
            weather forecasts, disease alerts) is based on AI models and
            third-party data. While we strive for accuracy, the guidance may not
            always reflect actual conditions. We are not responsible for any
            losses or damages caused by reliance on the app’s recommendations.
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
            Users can list, buy, or sell rubber waste through our marketplace.
            We do not guarantee the performance, payment, or delivery of items.
            All negotiations are between users. Use caution and verify
            buyer/seller legitimacy.
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
            All content, logos, code, and designs in RubberTapAI are the
            property of the development team. You may not use them without
            written permission.
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
            We may update or modify the app and these Terms at any time.
            Continued use after updates constitutes acceptance of the changes.
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
            We reserve the right to suspend or terminate your account without
            notice if you violate these Terms.
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
            RubberTapAI is provided “as is.” We do not guarantee that the App
            will be error-free or uninterrupted. We are not liable for any
            direct or indirect damages arising from your use of the App.
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
            These Terms are governed by the laws of the Philippines. Any
            disputes shall be resolved in the appropriate courts of Cebu City.
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
        </ScrollView>
      </BackgroundGradient>
    </View>
  );
}
