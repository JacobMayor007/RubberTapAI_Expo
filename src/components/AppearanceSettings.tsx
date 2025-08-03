import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Fontisto from "@expo/vector-icons/Fontisto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, useColorScheme } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";

type AppearanceProps = {
  setVisibleModal: (visible: boolean) => void;
};

const AppearanceSettings = ({ setVisibleModal }: AppearanceProps) => {
  const systemTheme = useColorScheme();
  const [themeType, setThemeType] = useState("");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const storedThemeType = await AsyncStorage.getItem("appearance");
        const storedTheme = await AsyncStorage.getItem("theme");

        setTheme(
          storedTheme === "System" ? systemTheme || "" : storedThemeType || ""
        );
        if (storedThemeType) setThemeType(storedTheme || "");
        if (storedThemeType) setTheme(storedThemeType);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const handleThemeChange = async (title: string, label: string) => {
    try {
      setThemeType(label);
      setTheme(title);
      await AsyncStorage.setItem("appearance", title);
      await AsyncStorage.setItem("theme", label);
    } catch (error) {
      console.error(error);
    }
  };
  const themeMode = [
    {
      key: 0,
      label: "Light theme",
      title: "light",
    },
    {
      key: 1,
      label: "Dark theme",
      title: "dark",
    },
    {
      key: 2,
      label: "System",
      title: systemTheme || "dark",
    },
  ];

  console.log("setTheme: ", themeType);

  return (
    <SafeAreaView
      className={`flex-1 ${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} p-6 gap-2`}
    >
      <FontAwesome5
        name="arrow-left"
        size={20}
        onPress={() => setVisibleModal(false)}
        color={theme === "dark" ? "white" : "black"}
      />
      <AppText
        color={theme === "dark" ? "light" : "dark"}
        className="text-xl font-bold mt-2 font-poppins"
      >
        Appearance
      </AppText>
      {themeMode.map((data) => {
        return (
          <Pressable
            onPress={() => handleThemeChange(data.title, data.label)}
            key={data?.key}
            className="flex-row items-center gap-4"
          >
            {themeType === data?.label ? (
              <Fontisto name="radio-btn-active" color={"#009A1C"} size={22} />
            ) : (
              <Fontisto
                name="radio-btn-passive"
                color={theme === "dark" ? "white" : "black"}
                size={22}
              />
            )}
            <AppText color={theme === "dark" ? "light" : "dark"}>
              {data?.label}
            </AppText>
          </Pressable>
        );
      })}
      <AppText color={theme === "dark" ? "light" : "dark"}>
        If system is selected, RubberTapAI will automatically adjust your
        appearance on your device{"'"}s system settings.
      </AppText>
    </SafeAreaView>
  );
};

export default AppearanceSettings;
