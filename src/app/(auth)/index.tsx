import { AppText } from "@/src/components/AppText";
import { Button } from "@/src/components/Button";
import ForgotPassword from "@/src/components/ForgotPassword";
import Logo from "@/src/components/Logo";
import { ViewPressable } from "@/src/components/ViewPressable";
import { useAuth } from "@/src/contexts/AuthContext";
import { account } from "@/src/lib/appwrite";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { openAuthSessionAsync } from "expo-web-browser";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { OAuthProvider } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const router = useRouter();
  const auth = useAuth();
  const [focusedInput, setFocusedInput] = useState("");
  const [forgotModal, setForgotModal] = useState(false);

  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      await auth.login(userInfo.email, userInfo.password);

      router.replace("/(tabs)");
    } catch (err) {
      console.log("Login error", err);

      Alert.alert("Login Attempt Failed", `${err}`);
    }
  };

  const googleAuth = async () => {
    try {
      const redirectUri = Linking.createURL("/");

      // Request OAuth2 Token URL
      const response = account.createOAuth2Token(
        OAuthProvider.Google,
        redirectUri
      );

      if (!response) throw new Error("Failed to start login");

      // Open Auth session
      const browserResult = await openAuthSessionAsync(
        response.toString(),
        redirectUri
      );

      if (browserResult.type !== "success") {
        throw new Error("Failed to login");
      }

      // Extract credentials from URL
      const url = new URL(browserResult.url);
      const secret = url.searchParams.get("secret")?.toString();
      const userId = url.searchParams.get("userId")?.toString();

      if (!userId || !secret) {
        throw new Error("Missing credentials from redirect");
      }
      const session = await account.createSession(userId, secret);
      if (!session) throw new Error("Failed to create session");

      const user = await account.get();
      auth.setUser(user);
      router.replace("/(tabs)");
      return true;
    } catch (error) {
      console.log("Google Auth error:", error);
      return false;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFECCC]">
      <KeyboardAvoidingView behavior="height" keyboardVerticalOffset={0}>
        <ScrollView>
          <View className="py-6 px-2">
            <MaterialIcons
              name="keyboard-arrow-left"
              size={40}
              onPress={() => router.replace("/getStarted")}
            />
            <View className="flex-col items-center justify-center pt-14 ">
              <Logo className="h-24 w-24" />
              <View className="flex-col ">
                <Image
                  source={require("@/assets/images/RubberTapText.png")}
                  className="h-16 w-56"
                />
                <AppText className="text-right text-[#75A90A] font-medium text-xl font-poppins">
                  AI
                </AppText>
              </View>
              <View className="w-full gap-4 px-10">
                <AppText className="font-poppins font-extrabold text-center text-black text-3xl mb-2">
                  Welcome
                </AppText>
                <TextInput
                  value={userInfo.email}
                  onFocus={() => setFocusedInput("first")}
                  onBlur={() => setFocusedInput("")}
                  placeholder="Email"
                  placeholderTextColor={"#797979"}
                  className={`h-14 text-slate-800 border-2 rounded-md px-4 ${
                    focusedInput === "first"
                      ? "border-[#6B8E23] border-2"
                      : "border-[#727272]"
                  }`}
                  onChangeText={(e) => setUserInfo({ ...userInfo, email: e })}
                />
                <View>
                  <TextInput
                    value={userInfo.password}
                    secureTextEntry={true}
                    placeholderTextColor={"#797979"}
                    onFocus={() => setFocusedInput("second")}
                    onBlur={() => setFocusedInput("")}
                    placeholder="Password"
                    className={`h-14 text-slate-800 border-2 rounded-md px-4 ${
                      focusedInput === "second"
                        ? "border-[#6B8E23] border-2"
                        : "border-[#727272]"
                    }`}
                    onChangeText={(e) =>
                      setUserInfo({ ...userInfo, password: e })
                    }
                  />
                </View>

                <Pressable onPress={() => setForgotModal(true)}>
                  <AppText className="font-poppins font-bold text-[#064B0E] text-right">
                    Forgot Password?
                  </AppText>
                </Pressable>

                <Button
                  title="Login"
                  onPress={handleLogin}
                  className="rounded-full font-bold font-poppins text-lg py-1"
                />
              </View>
            </View>
            <ViewPressable
              onPress={googleAuth}
              className=" bg-white mx-10 w-20 h-16 mt-8 rounded-xl justify-center items-center"
            >
              <AntDesign size={32} name="google" color={"green"} />
            </ViewPressable>
            <View className="flex-row justify-center mt-5 gap-2">
              <AppText className="text-black">Don't have an account?</AppText>
              <AppText
                className="text-black underline"
                onPress={() => router.push("/(auth)/register")}
              >
                Sign up
              </AppText>
            </View>
          </View>
        </ScrollView>
        <Modal visible={forgotModal} animationType="slide">
          <ForgotPassword setForgotModal={setForgotModal} />
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
