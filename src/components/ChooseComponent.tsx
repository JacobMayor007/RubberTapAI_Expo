import { Link } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { AppText } from "./AppText";

export default function ChooseComponent() {
  return (
    <View className="bg-black/50 flex-1">
      <View className="h-32">
        <TouchableOpacity>
          <Link href={"/(camera)"}>
            <AppText>Leaf Disease Detection</AppText>
          </Link>
        </TouchableOpacity>
        <TouchableOpacity>
          <Link href={{ pathname: "/(camera)/measure" }}>
            <AppText>Measurement</AppText>
          </Link>
        </TouchableOpacity>
      </View>
    </View>
  );
}
