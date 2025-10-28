import Feather from "@expo/vector-icons/Feather";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";

type ConfirmOrCancelModalProps = {
  children?: React.ReactNode;
  onOk?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  heightSize: 48 | 60 | 72 | 96;
  className?: string;
  borderRounded?: number;
  blurIntensity?:
    | 0
    | 0.5
    | 10
    | 15
    | 20
    | 25
    | 30
    | 35
    | 40
    | 45
    | 50
    | 55
    | 60
    | 65
    | 70
    | 75
    | 80
    | 85
    | 90
    | 95
    | 100;
  padding?: 12 | number;
};

export default function ConfirmCancelModal({
  children,
  onOk,
  onCancel,
  heightSize,
  blurIntensity,
  borderRounded,
  onClose,
  padding,
}: ConfirmOrCancelModalProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{
        padding,
        flexGrow: 1,
        backgroundColor:
          theme === "dark"
            ? `rgba(255,255,255,${(blurIntensity ?? 0) / 100})`
            : `rgba(0,0,0,${(blurIntensity ?? 0) / 100})`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          height: heightSize * 2.5,
          width: "100%",
          position: "relative",
          padding: padding,
          borderRadius: borderRounded,
        }}
        className={`${theme === "dark" ? `bg-black/80` : `bg-[#FFECCC]`} z-10 pr-12`}
      >
        <TouchableOpacity
          onPress={onClose}
          style={{ top: 14, zIndex: 20 }}
          className="absolute right-4 "
        >
          <Feather name="x" size={24} />
        </TouchableOpacity>
        {children}
        <View
          style={{
            margin: padding,
          }}
          className={`flex-row gap-5 absolute bottom-0 right-0 `}
        >
          <TouchableOpacity
            onPress={onCancel}
            style={{
              boxShadow:
                "1px 1px 1px 1px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            }}
            className="h-8 w-24 bg-slate-500  items-center justify-center rounded-md"
          >
            <Text className="text-white">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onOk}
            style={{
              boxShadow:
                "1px 1px 1px 1px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            }}
            className="h-8 w-24 bg-green-500 items-center justify-center rounded-md"
          >
            <Text className="text-white">Ok</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
