import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { SafeAreaView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";

type HelpAndSupportProps = {
  setVisibleModal: (visible: boolean) => void;
};

const HelpAndSupport = ({ setVisibleModal }: HelpAndSupportProps) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      className={`flex-1 ${theme === "dark" ? `bg-gray-900` : `bg-[#E8DFD0]`} p-6`}
    >
      <FontAwesome5
        name="arrow-left"
        size={20}
        onPress={() => setVisibleModal(false)}
        color={theme === "dark" ? `white` : `black`}
      />
      <AppText className="mt-6 text-xl font-bold">Help And Support</AppText>
    </SafeAreaView>
  );
};

export default HelpAndSupport;
