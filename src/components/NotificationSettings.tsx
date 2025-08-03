import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useState } from "react";
import { SafeAreaView, Switch, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";

type NotificationProps = {
  setVisibleModal: (visible: boolean) => void;
};

const NotificationSettings = ({ setVisibleModal }: NotificationProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const { theme } = useTheme();

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
          thumbColor={isEnabled ? "white" : "#f4f3f4"}
          onValueChange={toggleSwitch}
          value={isEnabled}
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
            trackColor={{ false: "#767577", true: "#009A1C" }}
            thumbColor={isEnabled ? "white" : "#f4f3f4"}
            onValueChange={toggleSwitch}
            value={isEnabled}
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
            trackColor={{ false: "#767577", true: "#009A1C" }}
            thumbColor={isEnabled ? "white" : "#f4f3f4"}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        <View className="flex-row justify-between items-center  w-full">
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="font-poppins text-lg font-medium"
          >
            Wintering alerts
          </AppText>
          <Switch
            trackColor={{ false: "#767577", true: "#009A1C" }}
            thumbColor={isEnabled ? "white" : "#f4f3f4"}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </View>
      <View className="flex-col  border-b-[0.5px] border-[#046A10] pb-4">
        <AppText
          className={`font-poppins font-extralight my-2 text-sm ${theme === "dark" ? `text-white` : `text-[rgb(87,59,46,0.80)]`}`}
        >
          Notification Preferences
        </AppText>

        <View className="flex-row justify-between items-center w-full">
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="font-poppins text-lg font-medium"
          >
            Vibrate on ring
          </AppText>
          <Switch
            trackColor={{ false: "#767577", true: "#009A1C" }}
            thumbColor={isEnabled ? "white" : "#f4f3f4"}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        <View className="flex-row justify-between items-center  w-full">
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="font-poppins text-lg font-medium"
          >
            In-app sounds
          </AppText>
          <Switch
            trackColor={{ false: "#767577", true: "#009A1C" }}
            thumbColor={isEnabled ? "white" : "#f4f3f4"}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        <View className="flex-row justify-between items-center  w-full">
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="font-poppins text-lg font-medium"
          >
            Lock screen notifications
          </AppText>
          <Switch
            trackColor={{ false: "#767577", true: "#009A1C" }}
            thumbColor={isEnabled ? "white" : "#f4f3f4"}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NotificationSettings;
