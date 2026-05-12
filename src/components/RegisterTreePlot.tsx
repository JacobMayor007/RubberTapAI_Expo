import { Profile } from "@/types";
import Feather from "@expo/vector-icons/Feather";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";
import { useUser } from "../hooks/tsHooks";

type AppearanceProps = {
  setRegisterModal: (visible: boolean) => void;
  setSaveModal: (visible: boolean) => void;
};

export default function RegisterPlot({
  setRegisterModal,
  setSaveModal,
}: AppearanceProps) {
  const { theme } = useTheme();
  const [focusedInput, setFocusedInput] = useState(false);
  const [name, setName] = useState("");
  const { data: profile } = useUser();

  const toSavePlot = async () => {
    try {
      if (!name) {
        return Alert.alert("Error", "Please input the name of your Plot");
      }

      const data = {
        userId: profile?.$id,
        name: name,
        API_KEY: profile?.API_KEY,
      };

      const save = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/plots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!save.ok) {
        Alert.alert("Error", "There is an error occured. Try Again!");
      }

      if (save.ok) {
        setRegisterModal(false);
        setSaveModal(true);
        return Alert.alert("Successful", "Successfully added a plot!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView className="bg-black/30 flex-1 p-4 flex-col justify-center">
      <View
        style={{
          boxShadow:
            "4px 8px 1px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
        }}
        className={`${theme === "dark" ? `bg-gray-900` : `bg-[#f8c774]`} p-5 h-60 rounded-lg flex-col justify-between`}
      >
        <View className="flex-col">
          <View
            style={{
              marginBottom: 32,
            }}
            className="flex-row items-center justify-between"
          >
            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className="font-bold text-lg tracking-wide"
            >
              Register Plot
            </AppText>
            <Feather
              name="x-circle"
              size={24}
              color={theme === "dark" ? `"white"` : `maroon`}
              onPress={() => {
                setRegisterModal(false);
              }}
              className="font-bold"
            />
          </View>
          <TextInput
            placeholderTextColor={"#797979"}
            onFocus={() => setFocusedInput(true)}
            onBlur={() => setFocusedInput(false)}
            value={name}
            onChangeText={(e) => setName(e)}
            style={{
              boxShadow:
                "1px 1px 1px 1px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            }}
            placeholder="Enter Plot Name:"
            className={`px-4 h-12 rounded-md items-center ${focusedInput ? `border-[1px] border-blue-500` : `border-none`}`}
          />
        </View>
        <View className="justify-end flex-row gap-5">
          <TouchableOpacity
            onPress={() => {
              setRegisterModal(false);
            }}
            style={{
              boxShadow:
                "1px 1px 1px 1px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            }}
            className="h-8 w-24 bg-slate-500 items-center justify-center rounded-md"
          >
            <Text className="text-white">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toSavePlot}
            style={{
              boxShadow:
                "1px 1px 1px 1px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            }}
            className="h-8 w-24 bg-[#75A90A] items-center justify-center rounded-md"
          >
            <Text className="text-white">Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
