import { Profile } from "@/types";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useEffect, useState } from "react";
import { SafeAreaView, Switch, View } from "react-native";
import {
  updateMarket,
  updateMessage,
  updateNotif,
  updateWeather,
} from "../action/userAction";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";
import Loading from "./LoadingComponent";

type NotificationProps = {
  setVisibleModal: (visible: boolean) => void;
};

const NotificationSettings = ({ setVisibleModal }: NotificationProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchProfile();
  }, []);

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

      const data: Profile = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSwitch = async (notifSettings: string) => {
    try {
      setLoading(true);

      switch (notifSettings) {
        case "notif": {
          await updateNotif(profile);
          break;
        }
        case "weather": {
          await updateWeather(profile);
          break;
        }
        case "message": {
          await updateMessage(profile);
          break;
        }
        case "market": {
          await updateMarket(profile);
          break;
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      await fetchProfile();
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FFECCC] items-center justify-center">
        <Loading className="h-16 w-16" />
      </SafeAreaView>
    );
  }

  console.log("Notif: ", profile?.notif);

  return (
    <SafeAreaView
      className={`flex-1 ${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} p-6 gap-2`}
    >
      <FontAwesome5
        name="arrow-left"
        size={20}
        onPress={() => setVisibleModal(false)}
        color={theme === "dark" ? `white` : `black`}
      />
      <AppText
        color={theme === "dark" ? `light` : `dark`}
        className="font-poppins font-bold text-xl mt-5"
      >
        Notification Settings
      </AppText>
      <View className="flex-row justify-between items-center border-b-[0.5px] border-[#046A10] pb-2">
        <AppText
          color={theme === "dark" ? `light` : `dark`}
          className="font-poppins text-lg"
        >
          Enable notifications
        </AppText>
        <Switch
          trackColor={{ false: "#767577", true: "#009A1C" }}
          thumbColor={profile?.notif ? "white" : "#f4f3f4"}
          onValueChange={() => {
            toggleSwitch("notif");
          }}
          value={profile?.notif}
        />
      </View>
      <View className="flex-col justify-between items-center border-b-[0.5px] border-[#046A10] pb-4">
        <View className="flex-row justify-between items-center w-full">
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="font-poppins text-lg font-medium"
          >
            Rubber market price
          </AppText>
          <Switch
            disabled={profile?.notif ? false : true}
            trackColor={{ false: "#767577", true: "#009A1C" }}
            thumbColor={profile?.marketAlert ? "white" : "#f4f3f4"}
            onValueChange={() => {
              toggleSwitch("market");
            }}
            value={profile?.marketAlert}
          />
        </View>
        <View className="flex-row justify-between items-center  w-full">
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="font-poppins text-lg font-medium"
          >
            Incoming rain alerts
          </AppText>
          <Switch
            disabled={profile?.notif ? false : true}
            trackColor={{ false: "#767577", true: "#009A1C" }}
            thumbColor={profile?.weatherAlert ? "white" : "#f4f3f4"}
            onValueChange={() => {
              toggleSwitch("weather");
            }}
            value={profile?.weatherAlert}
          />
        </View>
        <View className="flex-row justify-between items-center  w-full">
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="font-poppins text-lg font-medium"
          >
            Message alerts
          </AppText>
          <Switch
            disabled={profile?.notif ? false : true}
            trackColor={{ false: "#767577", true: "#009A1C" }}
            thumbColor={profile?.messageAlert ? "white" : "#f4f3f4"}
            onValueChange={() => {
              toggleSwitch("message");
            }}
            value={profile?.messageAlert}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NotificationSettings;
