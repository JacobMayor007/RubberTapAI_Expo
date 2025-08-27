import "@/global.css";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { Slot } from "expo-router";
import "react-native-reanimated";
import { LocationProvider } from "../contexts/LocationContext";
import { MessageProvider } from "../contexts/MessageContext";
import { ThemeProvider } from "../contexts/ThemeContext";

export default function RootLayout() {
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
