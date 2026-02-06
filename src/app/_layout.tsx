import "@/global.css";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { Slot } from "expo-router";
import "react-native-reanimated";
import { LocationProvider } from "../contexts/LocationContext";
import { MessageProvider } from "../contexts/MessageContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { WeatherProvider } from "../contexts/WeatherContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <MessageProvider>
            <LocationProvider>
              <WeatherProvider>
                <Slot />
              </WeatherProvider>
            </LocationProvider>
          </MessageProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
