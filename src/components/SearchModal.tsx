import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useRouter } from "expo-router";
import { TextInput, View } from "react-native";
import Logo from "./Logo";

export default function SeachModal() {
  const router = useRouter();
  return (
    <View className=" flex-1 flex-col p-6 bg-[#E8DFD0]">
      <View className="flex-row gap-4 items-center">
        <FontAwesome5
          name="arrow-left"
          size={20}
          onPress={() => router.push("/(message)")}
        />
        <View className="bg-[rgb(43,43,43,0.2)] h-12 w-11/12 rounded-3xl gap-2 flex-row items-center px-2">
          <Logo className="h-10 w-10 mt-1 " />
          <TextInput
            placeholder="Search user"
            className="h-full w-10/12 placeholder:font-poppins placeholder:font-extrabold placeholder:text-slate-800"
          />
        </View>
      </View>
    </View>
  );
}
