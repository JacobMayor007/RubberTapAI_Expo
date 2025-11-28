import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Fontisto from "@expo/vector-icons/Fontisto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, useColorScheme, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";
import BackgroundGradient from "./BackgroundGradient";

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
        // 🔹 Get the label (Light theme, Dark theme, System)
        const storedLabel = await AsyncStorage.getItem("theme");
        // 🔹 Get the actual theme value (light, dark)
        const storedTheme = await AsyncStorage.getItem("appearance");

        console.log("Stored Label (theme):", storedLabel);
        console.log("Stored Theme (appearance):", storedTheme);

        // 🔹 If label exists, use it to set themeType
        if (storedLabel) {
          setThemeType(storedLabel);
        }

        // 🔹 If theme exists, use it to set the actual theme
        if (storedTheme) {
          setTheme(storedTheme);
        } else if (storedLabel === "System") {
          // 🔹 If System is selected, use the device system theme
          setTheme(systemTheme || "dark");
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [systemTheme, setTheme]);

  const handleThemeChange = async (title: string, label: string) => {
    try {
      setThemeType(label);
      setTheme(title);
      // 🔹 appearance = the actual theme (light/dark)
      await AsyncStorage.setItem("appearance", title);
      // 🔹 theme = the label (Light theme, Dark theme, System)
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

  console.log("Current theme:", theme);
  console.log("Current label:", themeType);

  return (
    <BackgroundGradient className={`flex-1 p-6 `}>
      <View className="flex-row items-center gap-4 mb-4">
        <FontAwesome5
          name="arrow-left"
          size={20}
          onPress={() => setVisibleModal(false)}
          color={theme === "dark" ? "white" : "black"}
        />
        <AppText
          color={theme === "dark" ? "light" : "dark"}
          className="text-xl font-bold font-poppins "
        >
          Appearance
        </AppText>
      </View>
      {themeMode.map((data) => {
        return (
          <Pressable
            onPress={() => handleThemeChange(data.title, data.label)}
            key={data?.key}
            className="flex-row items-center gap-4 my-2"
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
    </BackgroundGradient>
  );
};

export default AppearanceSettings;
