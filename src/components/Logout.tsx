import React from "react";
import { Pressable, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { AppText } from "./AppText";

type AppearanceProps = {
  setVisibleModal: (visible: boolean) => void;
};

export default function Logout({ setVisibleModal }: AppearanceProps) {
  const { logout } = useAuth();

  return (
    <View className={`flex-1 px-6 justify-end bg-black/40`}>
      <View className="h-[30%] items-center justify-center gap-5">
        <Pressable
          onPress={logout}
          className="h-12 w-full bg-white rounded-md items-center justify-center"
        >
          <AppText className="text-red-500 text-xl font-poppins font-bold">
            Log Out
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => setVisibleModal(false)}
          className="h-12 w-full bg-white rounded-md items-center justify-center"
        >
          <AppText className="text-xl font-poppins font-bold text-yellow-500">
            Cancel
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
