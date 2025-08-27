import { AppText } from "@/src/components/AppText";
import { Button } from "@/src/components/Button";
import Loading from "@/src/components/LoadingComponent";
import Logo from "@/src/components/Logo";
import { ViewPressable } from "@/src/components/ViewPressable";
import { useAuth } from "@/src/contexts/AuthContext";
import { account, database } from "@/src/lib/appwrite";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Checkbox from "expo-checkbox";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { openAuthSessionAsync } from "expo-web-browser";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import { ID, OAuthProvider } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Register() {
  const router = useRouter();
  const [focusedInput, setFocusedInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [userInfo, setUserInfo] = useState({
    fullName: "",
    fName: "",
    lName: "",
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
  });
  const [agree, setAgree] = useState(false);
  const auth = useAuth();

  const signUp = async () => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

    if (!userInfo.fName) {
      Alert.alert("Required field", "Please enter your first name");
      return;
    }

    if (!userInfo.lName) {
      Alert.alert("Required field", "Please enter your last name");
      return;
    }

    if (!userInfo.userName) {
      Alert.alert("Required field", "Please enter your username");
      return;
    }

    if (!userInfo.email) {
      Alert.alert("Required field", "Please enter your email");
      return;
    }

    if (!userInfo.password) {
      Alert.alert("Required field", "Please enter password");
      return;
    }

    if (!userInfo.confirmPassword) {
      Alert.alert("Required field", "Please enter confirm password");
      return;
    }

    if (!regex.test(userInfo.password)) {
      Alert.alert(
        "Invalid Password",
        "Your password must have a capital letter, a symbol, and at least 8 characters."
      );
      return;
    }

    if (userInfo.password.length < 9) {
      Alert.alert(
        "Password Invalid",
        "Password must be more than 8 characters!",
        [
          {
            text: "Ok",
            style: "default",
          },
        ]
      );
      return;
    }

    if (userInfo.password !== userInfo.confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "Confirm Password does not match Password."
      );
      return;
    }

    if (!agree) {
      Alert.alert(
        "Terms Agreement",
        "You must agree to the terms and conditions."
      );
      return;
    }

    try {
      setLoading(true);

      await account.create(
        ID.unique(),
        userInfo.email,
        userInfo.password,
        `${userInfo.fName} ${userInfo.lName}`
      );

      const session = await account.createEmailPasswordSession(
        userInfo.email,
        userInfo.password
      );
      if (!session) throw new Error("Failed to create session");

      const user = await account.get();
      const userId = user.$id;
      const userEmail = user.email;
      const userName = user.name;
      const userProfile =
        user?.prefs?.picture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

      const data = {
        userId: userId,
        username: userInfo.userName,
        fullName: userName,
        fName: userInfo.fName,
        lName: userInfo.lName,
        email: userEmail,
        imageURL: userProfile,
        role: "farmer",
        notifSettings: false,
        themeSettings: false,
        subscription: false,
      };

      const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/`, {
        method: "POST",
        headers: {
          "X-API-Key": `${process.env.EXPO_PUBLIC_RUBBERTAPAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        Alert.alert(`${response.status}`);
      }

      const status = await response.json();

      Alert.alert(`${status.title}`, `${status.message}`);

      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error registering user:", error);
      Alert.alert("Register Failed", "Failed to create account");
    } finally {
      setLoading(false);
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
      const userEmail = user.email;
      const userName = user.name;
      const userProfile =
        user?.prefs?.picture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

      try {
        await database.getDocument(
          "686156d00007a3127068",
          "686b71a300125286e377",
          userId
        );
        console.log("User already exists in database.");
      } catch (err) {
        await database.createDocument(
          "686156d00007a3127068",
          "686b71a300125286e377",
          userId,
          {
            username: userName,
            email: userEmail,
            address: [],
            imageURL: userProfile,
            role: "farmer",
            notifSettings: false,
            themeSettings: false,
            subscription: false,
          }
        );
        console.log("User document created successfully.");
      }
      router.replace("/(tabs)");
      return true;
    } catch (error) {
      console.log("Google Auth error:", error);
      return false;
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FFECCC] items-center justify-center">
        <Loading className="h-12 w-12" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FFECCC]">
      <KeyboardAvoidingView behavior="height" keyboardVerticalOffset={0}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="px-4 h-full py-10">
            <View className="flex-row justify-between items-center">
              <MaterialIcons
                name="keyboard-arrow-left"
                size={40}
                onPress={() => router.replace("/getStarted")}
              />
              <Logo className="h-11 w-11" />
            </View>
            <View className="mt-4 flex-col gap-2">
              <AppText
                color="dark"
                className="text-center font-poppins font-bold text-3xl"
              >
                Create an Account
              </AppText>
              <AppText
                color="dark"
                className="text-center font-poppins font-medium"
              >
                Create an account so you can explore the tapping features.
              </AppText>
            </View>
            <View className="mt-6 flex-col gap-8 ">
              <TextInput
                placeholder="First Name"
                value={userInfo.fName}
                placeholderTextColor={"#797979"}
                onFocus={() => setFocusedInput("first")}
                onBlur={() => setFocusedInput("")}
                onChangeText={(e) => setUserInfo({ ...userInfo, fName: e })}
                className={`h-14 text-slate-800 border-2 rounded-md px-4 ${
                  focusedInput === "first"
                    ? "border-[#6B8E23] border-2"
                    : "border-[#727272]"
                }`}
              />
              <TextInput
                placeholder="Last Name"
                value={userInfo.lName}
                placeholderTextColor={"#797979"}
                onFocus={() => setFocusedInput("second")}
                onBlur={() => setFocusedInput("")}
                onChangeText={(e) => setUserInfo({ ...userInfo, lName: e })}
                className={`h-14 text-slate-800 border-2 rounded-md px-4 ${
                  focusedInput === "second"
                    ? "border-[#6B8E23] border-2"
                    : "border-[#727272]"
                }`}
              />
              <TextInput
                placeholder="Email"
                value={userInfo.email}
                onChangeText={(e) => setUserInfo({ ...userInfo, email: e })}
                onFocus={() => setFocusedInput("third")}
                placeholderTextColor={"#797979"}
                onBlur={() => setFocusedInput("")}
                className={`h-14 text-slate-800 border-2 rounded-md px-4 ${
                  focusedInput === "third"
                    ? "border-[#6B8E23] border-2"
                    : "border-[#727272]"
                }`}
              />
              <TextInput
                placeholder="Username"
                value={userInfo.userName}
                placeholderTextColor={"#797979"}
                onChangeText={(e) => setUserInfo({ ...userInfo, userName: e })}
                onFocus={() => setFocusedInput("fourth")}
                onBlur={() => setFocusedInput("")}
                className={`h-14 text-slate-800 border-2 rounded-md px-4 ${
                  focusedInput === "fourth"
                    ? "border-[#6B8E23] border-2"
                    : "border-[#727272]"
                }`}
              />
              <View className="relative">
                <TextInput
                  value={userInfo.password}
                  placeholderTextColor={"#797979"}
                  onChangeText={(e) =>
                    setUserInfo({ ...userInfo, password: e })
                  }
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedInput("fifth")}
                  onBlur={() => setFocusedInput("")}
                  className={`h-14 text-slate-800 border-2 rounded-md px-4 ${
                    focusedInput === "fifth"
                      ? "border-[#6B8E23] border-2"
                      : "border-[#727272]"
                  }`}
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

              <View className="relative">
                <TextInput
                  value={userInfo.confirmPassword}
                  onChangeText={(e) =>
                    setUserInfo({ ...userInfo, confirmPassword: e })
                  }
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor={"#797979"}
                  placeholder="Confirm Password"
                  onFocus={() => setFocusedInput("sixth")}
                  onBlur={() => setFocusedInput("")}
                  className={`h-14 text-slate-800 border-2 rounded-md px-4 ${
                    focusedInput === "sixth"
                      ? "border-[#6B8E23] border-2"
                      : "border-[#727272]"
                  }`}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-4"
                >
                  {showConfirmPassword ? (
                    <Feather name="eye" size={20} />
                  ) : (
                    <Feather name="eye-off" size={20} />
                  )}
                </Pressable>
              </View>
            </View>
            <View className="flex-row gap-2 mt-8">
              <Checkbox
                value={agree}
                onValueChange={() => setAgree((prev) => !prev)}
                className={agree ? "#4630EB" : undefined}
              />
              <AppText className="text-[#6B8E23] font-semibold font-poppins">
                Agree to terms & conditions
              </AppText>
            </View>
            <View className="mt-4">
              <Button
                title="Sign Up"
                onPress={signUp}
                className="text-xl font-bold tracking-widest py-1.5"
              />
            </View>
            <ViewPressable
              onPress={googleAuth}
              className=" bg-white w-20 h-16 mt-2 rounded-xl justify-center items-center"
            >
              <AntDesign size={32} name="google" color={"green"} />
            </ViewPressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
