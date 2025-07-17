import { getUserByIdDirect } from "@/src/action/userAction";
import { AppText } from "@/src/components/AppText";
import Logo from "@/src/components/Logo";
import { useAuth } from "@/src/contexts/AuthContext";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface User {
  $id: string;
  $createdAt?: string;
  username: string;
  notifSettings: string;
  themeSettings: string;
  subscription: string;
  imageURL: string;
}

export default function Menu() {
  const router = useRouter();
  const { user } = useAuth();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [emailHide, setEmailHide] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.$id) {
        const userProfile = await getUserByIdDirect(user.$id);
        setProfile(userProfile);
      }
    };
    fetchProfile();
  }, [user?.$id]);

  useEffect(() => {
    const emailToHide = user?.email.split("@")[0];
    var asterisk = "";
    for (var i = 0; i < Number(emailToHide?.length); i++) {
      asterisk += "*";
    }
    setEmailHide(asterisk);
  }, [user?.email, setEmailHide]);

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 flex-col justify-between">
        <View className="bg-[#E8DFD0] flex-1 px-6 py-10 flex-col ">
          <View className="flex-row items-center justify-between ">
            <View className="flex-row items-center gap-4">
              <FontAwesome5
                name="arrow-left"
                size={20}
                onPress={() => router.back()}
              />
              <AppText
                color="dark"
                className="font-poppins font-extrabold text-2xl"
              >
                Menu
              </AppText>
            </View>
            <Logo className="w-12 h-12" />
          </View>
          <View className="h-72 rounded-2xl bg-white drop-shadow-lg mt-8">
            <LinearGradient
              colors={["#75A90A", "#046A10"]}
              style={{
                width: "100%",
                height: 80,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
              }}
            />
            <View className="flex-row justify-between items-center px-4">
              <View className="flex-row items-center  gap-2 -mt-5 overflow-hidden w-[75%] text-nowrap">
                <Image
                  className="h-14 w-14 rounded-full"
                  source={{ uri: profile?.imageURL }}
                />
                <AppText
                  color={"dark"}
                  className="font-poppins font-bold text-lg pt-4 text-ellipsis text-nowrap whitespace-nowrap"
                >
                  {user?.name}
                </AppText>
              </View>
              <View className="bg-[#75A90A] h-7 w-16 justify-center items-center rounded-full">
                <AppText>Edit</AppText>
              </View>
            </View>
            <View className="flex-1 bg-[#f5eee4] m-4 rounded-xl drop-shadow-2xl flex-col py-2 px-4 gap-1">
              <AppText
                color={"dark"}
                className="font-poppins font-extrabold text-base"
              >
                Username
              </AppText>
              <AppText color={profile?.themeSettings ? "light" : "dark"}>
                {profile?.username}
              </AppText>
              <AppText
                color={"dark"}
                className="font-poppins font-extrabold text-base"
              >
                Email
              </AppText>
              <AppText color={profile?.themeSettings ? "light" : "dark"}>
                {emailHide}@{user?.email.split("@")[1]}
              </AppText>
            </View>
          </View>
          <View className="flex-row justify-between items-center bg-[rgb(83,62,53,0.1)] mt-4 px-4 rounded-lg outline-dashed">
            <AppText color={"dark"} className="font-poppins font-bold text-lg">
              Notification Settings
            </AppText>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={40}
              onPress={() => router.back()}
            />
          </View>
          <View className="flex-row justify-between items-center mt-4 px-4 rounded-lg outline-dashed">
            <AppText color={"dark"} className="font-poppins font-bold text-lg">
              Appearance
            </AppText>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={40}
              onPress={() => router.back()}
            />
          </View>
          <View className="flex-row justify-between items-center mt-4 px-4 rounded-lg outline-dashed">
            <AppText color={"dark"} className="font-poppins font-bold text-lg">
              Help &#x26; Support
            </AppText>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={40}
              onPress={() => router.back()}
            />
          </View>
          <View className=" bg-[rgb(83,62,53,0.1)] mt-4 px-4 rounded-lg outline-dashed">
            <Pressable
              onPress={logout}
              className="flex-row justify-between items-center"
            >
              <AppText
                color={"dark"}
                className="font-poppins font-bold text-lg text-red-700"
              >
                Logout
              </AppText>
              <MaterialIcons name="keyboard-arrow-right" size={40} />
            </Pressable>
          </View>
        </View>
        <View className="bg-white h-20 flex-row items-center justify-between px-7 pb-2">
          <View className="mb-14 h-20 w-20 rounded-full bg-[#E8DFD0] items-center justify-center p-1.5">
            <View className="bg-white h-full w-full rounded-full items-center justify-center">
              <Feather
                name="menu"
                size={24}
                onPress={() => router.push("/(tabs)/menu")}
              />
            </View>
          </View>
          <Feather name="camera" size={24} />
          <Entypo
            name="home"
            size={32}
            onPress={() => router.push("/(tabs)")}
          />
          <FontAwesome
            name="arrow-trend-up"
            size={20}
            onPress={() => router.push("/(tabs)/market")}
          />
          <FontAwesome name="clock-rotate-left" size={20} />
        </View>
      </View>
    </SafeAreaView>
  );
}
