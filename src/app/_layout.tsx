import "@/global.css";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { Slot, useRouter } from "expo-router";
import { Platform } from "react-native";
import "react-native-reanimated";
import { LocationProvider } from "../contexts/LocationContext";
import { MessageProvider } from "../contexts/MessageContext";
import { ThemeProvider } from "../contexts/ThemeContext";

export default function RootLayout() {
  const router = useRouter();

  if (Platform.OS === "web") {
    router.replace("/");
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <MessageProvider>
          <LocationProvider>
            <Slot />
          </LocationProvider>
        </MessageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
