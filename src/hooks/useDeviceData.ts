import { useQuery, useMutation } from "@tanstack/react-query";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { globalFunction } from "@/src/global/fetchWithTimeout";
import { Profile } from "@/types";

// --- 1. Helper Functions (The "Service" logic) ---

async function getDeviceLocation() {
  // Try Cache First
  const cached = await AsyncStorage.getItem("user_address");
  if (cached) return JSON.parse(cached);

  // Permission Flow
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("Location Permission Denied");

  // Get GPS
  const coords = await Location.getCurrentPositionAsync();
  const response = await Location.reverseGeocodeAsync({
    latitude: coords.coords.latitude,
    longitude: coords.coords.longitude,
  });

  const address = response[0];
  if (address) {
    await AsyncStorage.setItem("user_address", JSON.stringify(address));
  }
  return address;
}

async function getPushToken() {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenData.data;
}

// --- 2. The Main Hook ---

export function useDeviceInitialization(userProfile: Profile) {
  // A. The "Boot" Query - Runs ONCE and caches the result
  const deviceQuery = useQuery({
    queryKey: ["device-init"], // Unique key for app session
    queryFn: async () => {
      // Run both in parallel for speed
      const [address, pushToken] = await Promise.all([
        getDeviceLocation().catch((e) => {
          console.warn(e);
          return null;
        }),
        getPushToken().catch((e) => {
          console.warn(e);
          return null;
        }),
      ]);

      return { address, pushToken };
    },
    // THE SECRET SAUCE:
    // This prevents the code from running again when you navigate back to Home
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // B. Server Sync Mutation (Location)
  const syncLocation = useMutation({
    mutationFn: async (city: string) => {
      if (!userProfile?.API_KEY || !city) return;
      await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/city`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            userId: userProfile.$id,
            API_KEY: userProfile.API_KEY,
            city: city,
          }),
        },
        20000,
      );
    },
  });

  // C. Server Sync Mutation (Push Token)
  const syncToken = useMutation({
    mutationFn: async (token: string) => {
      if (!userProfile?.API_KEY || !token) return;
      // Check if token actually changed before blasting the API
      if (userProfile?.pushToken === token) return;

      await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/push-token`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            userId: userProfile.$id,
            API_KEY: userProfile.API_KEY,
            token: token,
          }),
        },
        20000,
      );
    },
  });

  return {
    ...deviceQuery,
    syncLocation,
    syncToken,
  };
}
