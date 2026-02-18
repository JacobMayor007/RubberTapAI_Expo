import DashboardBackground from "@/src/components/DashboardBackground";
import Loading from "@/src/components/LoadingComponent";
import { useLocation } from "@/src/contexts/LocationContext";
import { useUser } from "@/src/hooks/tsHooks";
import { useDeviceInitialization } from "@/src/hooks/useDeviceData"; // Import your new hook
import { useEffect } from "react";
import {
  SafeAreaView as RNFSafeAreaView,
  ScrollView,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { setAddress } = useLocation();
  const { data: profile } = useUser();

  // 1. Call the Hook
  // Because staleTime is Infinity, 'isLoading' will be true ONLY the first time.
  // Every subsequent visit, it returns cached data instantly.
  const {
    data: deviceData,
    isLoading,
    syncLocation,
    syncToken,
  } = useDeviceInitialization(profile);

  // 2. Sync Logic (Side Effects)
  // This runs when the query finishes fetching data
  useEffect(() => {
    if (deviceData) {
      // Update Context for the rest of the app to use
      if (deviceData.address) {
        setAddress(deviceData.address);
        // Sync to server silently
        syncLocation.mutate(deviceData.address.city);
      }

      // Sync Token silently
      if (deviceData.pushToken) {
        syncToken.mutate(deviceData.pushToken);
      }
    }
  }, [deviceData]); // Only runs when data is ready

  // 3. Render
  if (isLoading) {
    return (
      <RNFSafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Loading className="h-16 w-16" />
        <Text style={{ marginTop: 12, letterSpacing: 1 }}>Initializing...</Text>
      </RNFSafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        contentContainerClassName={`bg-black/0 relative flex-1 flex-col justify-between`}
      >
        <DashboardBackground />
      </ScrollView>
    </SafeAreaView>
  );
}
