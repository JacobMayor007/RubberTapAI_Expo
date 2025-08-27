import { AppText } from "@/src/components/AppText";
import { Button } from "@/src/components/Button";
import ForgotPassword from "@/src/components/ForgotPassword";
import Logo from "@/src/components/Logo";
import { ViewPressable } from "@/src/components/ViewPressable";
import { useAuth } from "@/src/contexts/AuthContext";
import { account } from "@/src/lib/appwrite";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { makeRedirectUri } from "expo-auth-session";
import { Redirect, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
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
  const { user } = useAuth();
  const [focusedInput, setFocusedInput] = useState("");
  const [forgotModal, setForgotModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const isLoggedIn = async () => {
      if (user) {
        return <Redirect href={"/(tabs)"} />;
      }
    };

    isLoggedIn();
  }, [user]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await auth.login(userInfo.email, userInfo.password);

      router.replace("/(tabs)");
    } catch (err) {
      console.log("Login error", err);

      Alert.alert("Login Attempt Failed", `${err}`);
    } finally {
      setLoading(false);
    }
  };

  const googleAuth = async () => {
    // try {
    //   const redirectUri = Linking.createURL("/");

    //   // Request OAuth2 Token URL
    //   const response = account.createOAuth2Token(
    //     OAuthProvider.Google,
    //     redirectUri
    //   );

    //   if (!response) throw new Error("Failed to start login");

    //   // Open Auth session
    //   const browserResult = await openAuthSessionAsync(
    //     response.toString(),
    //     redirectUri
    //   );

    //   if (browserResult.type !== "success") {
    //     throw new Error("Failed to login");
    //   }

    //   // Extract credentials from URL
    //   const url = new URL(browserResult.url);
    //   const secret = url.searchParams.get("secret")?.toString();
    //   const userId = url.searchParams.get("userId")?.toString();

    //   if (!userId || !secret) {
    //     throw new Error("Missing credentials from redirect");
    //   }
    //   const session = await account.createSession(userId, secret);
    //   if (!session) throw new Error("Failed to create session");

    //   const user = await account.get();
    //   auth.setUser(user);
    //   router.replace("/(tabs)");
    //   return true;
    // } catch (error) {
    //   console.log("Google Auth error:", error);
    //   return false;
    // }
    try {
      const deepLink = makeRedirectUri({ preferLocalhost: true });
      const scheme = new URL(deepLink).protocol;

      const loginUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/account/sessions/oauth2/${OAuthProvider.Google}?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}&success=${encodeURIComponent(deepLink)}&failure=${encodeURIComponent(deepLink)}`;

      const result = await WebBrowser.openAuthSessionAsync(loginUrl, scheme);

      if (result.type === "success" && result.url) {
        const urlObj = new URL(result.url);
        const userId = urlObj.searchParams.get("userId");
        const secret = urlObj.searchParams.get("secret");

        if (!userId || !secret) {
          console.error("Missing credentials in redirect URL:", result.url);
          return;
        }

        await account.createSession(userId, secret);

        router.replace("/(tabs)");

        account
          .get()
          .then((user) => auth.setUser(user))
          .catch((err) => console.error("Failed to fetch user:", err));
      }
    } catch (err) {
      console.error("OAuth flow error:", err);
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
                <View className="relative">
                  <TextInput
                    value={userInfo.password}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={"#797979"}
                    onFocus={() => setFocusedInput("second")}
                    onBlur={() => setFocusedInput("")}
                    placeholder="Password"
                    className={`h-14 text-slate-800 border-2 rounded-md pl-4 pr-12 ${
                      focusedInput === "second"
                        ? "border-[#6B8E23] border-2"
                        : "border-[#727272]"
                    }`}
                    onChangeText={(e) =>
                      setUserInfo({ ...userInfo, password: e })
                    }
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-4"
                  >
                    {showPassword ? (
                      <Feather name="eye" size={20} />
                    ) : (
                      <Feather name="eye-off" size={20} />
                    )}
                  </Pressable>
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
              style={{
                boxShadow:
                  "4px 8px 1px 0px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              }}
              className=" bg-white mx-10 w-10/12 gap-2 flex-row h-14 mt-8 rounded-xl justify-center items-center"
            >
              <AntDesign size={32} name="google" color={"green"} />
              <AppText className="font-poppins font-bold text-lg text-green-700">
                Google
              </AppText>
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
