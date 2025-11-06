import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { account } from "../lib/appwrite";
import { AppText } from "./AppText";
import Logo from "./Logo";

type ChangePasswordProps = {
  setForgotModal: (visible: boolean) => void;
};

export default function ForgotPassword({
  setForgotModal,
}: ChangePasswordProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const sendStorage = await AsyncStorage.getItem("disableSend");

        if (sendStorage) {
          const { value, timestamp } = JSON.parse(sendStorage);

          const now = Date.now();
          const tenMinutes = 60 * 1000;

          if (value && now - timestamp < tenMinutes) {
            Alert.alert("Already been sent to your email");
            setSent(true);
            return;
          } else {
            await AsyncStorage.removeItem("disableSend");
            setSent(false);
          }
        }
      } catch (error) {
        console.error(error);
        setSent(false);
      }
    })();
  }, []);

  const handleSend = async () => {
    try {
      if (email === "") {
        Alert.alert("Sent Error", "Please input your email");
        setSent(false);

        return;
      }

      await account.createRecovery(
        email,
        "https://rubbertapai.netlify.app/forgot-password"
      );

      setSent(true);
      await AsyncStorage.setItem(
        "disableSend",
        JSON.stringify({
          value: true,
          timestamp: Date.now(),
        })
      );

      Alert.alert(
        "Email Successful!",
        "Please check your email for changing password!"
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Email Error", "Please input valid email address");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFECCC] p-7">
      <MaterialIcons
        name="keyboard-arrow-left"
        size={40}
        onPress={() => setForgotModal(false)}
      />
      <View className="flex-col items-center justify-center">
        <Logo className="h-24 w-24" />
        <Image
          source={require("@/assets/images/RubberTapText.png")}
          className="h-16 w-56"
        />
        <AppText className="text-right text-[#75A90A] font-medium text-xl font-poppins">
          AI
        </AppText>
        <AppText
          color={"dark"}
          className="font-poppins font-bold text-3xl mt-10"
        >
          Forgot Password
        </AppText>
        <AppText color={"dark"} className="my-1 text-center px-6 font-light">
          Enter the email address you registered with. An email containing a
          link to reset your password will be sent to you.
        </AppText>
        <TextInput
          placeholder="Email"
          placeholderTextColor={"#808080"}
          className="border w-full my-2 rounded-md px-2"
          value={email}
          onChangeText={(e) => setEmail(e)}
        />
        <Pressable
          onPress={() => {
            handleSend();
          }}
          disabled={sent ? true : false}
          className={`${sent ? `bg-[#eaeaea]` : `bg-[#6B8E23]`} py-3 items-center w-full rounded-lg`}
        >
          <AppText color={"light"} className="text-xl font-poppins font-bold">
            Send
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
