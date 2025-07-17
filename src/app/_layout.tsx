import "@/global.css";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { Slot } from "expo-router";
import { LocationProvider } from "../contexts/LocationContext";
import { MessageProvider } from "../contexts/MessageContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <MessageProvider>
        <LocationProvider>
          <Slot />
        </LocationProvider>
      </MessageProvider>
    </AuthProvider>
  );
}
