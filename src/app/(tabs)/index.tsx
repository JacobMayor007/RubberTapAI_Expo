import DashboardBackground from "@/src/components/DashboardBackground";
import { useAuth } from "@/src/contexts/AuthContext";
import { useLocation } from "@/src/contexts/LocationContext";
import { globalFunction } from "@/src/global/fetchWithTimeout";
import { Profile } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Linking } from "react-native";

import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView as RNFSafeAreaView,
  ScrollView,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const location = useLocation();

  const [profile, setProfile] = useState<Profile | null>(null);

  // Permission status for Location flow
  const [permissionStatus, setPermissionStatus] = useState<
    "checking" | "granted" | "denied"
  >("checking");

  // Loading states
  const [initializing, setInitializing] = useState(true);

  const shownDeniedAlertRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const cachedAddress = await AsyncStorage.getItem("user_address");
        if (cachedAddress) {
          try {
            const parsed = JSON.parse(cachedAddress);
            if (parsed) {
              location.setAddress(parsed);
            }
          } catch (e) {
            console.warn("Failed parsing cached address", e);
          }
        }

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setPermissionStatus("denied");
          setInitializing(false);
          return;
        }

        setPermissionStatus("granted");

        // 3. If we already have a cached address, don't re-query geolocation
        if (cachedAddress) {
          setInitializing(false);
          return;
        }

        // 4. Get current position and reverse geocode
        const coords = await Location.getCurrentPositionAsync();
        if (!coords) {
          console.warn("No coords returned from getCurrentPositionAsync");
          setInitializing(false);
          return;
        }

        const { latitude, longitude } = coords.coords;

        const response = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const res = response?.[0];
        if (res) {
          location.setAddress(res);
          await AsyncStorage.setItem("user_address", JSON.stringify(res));
        } else {
          console.warn("No reverse geocode result");
        }
      } catch (error) {
        // Only log — do not throw to avoid crashing the screen
        console.error("Location init error:", error);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (permissionStatus === "denied" && !shownDeniedAlertRef.current) {
      shownDeniedAlertRef.current = true;

      Alert.alert(
        "Location Disabled",
        "Location permission is required for some features. You can enable it in Settings. The app will continue with limited functionality.",
        [
          {
            text: "Open Settings",
            onPress: async () => {
              try {
                await Linking.openSettings();
              } catch (e) {
                console.warn("Failed to open settings", e);
              }
            },
          },
          {
            text: "OK",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    }
  }, [permissionStatus]);

  /* ---------------------------
     3) Fetch profile (safe to run regardless of location)
     - add AbortController for safety (avoids warnings on unmount)
     --------------------------- */
  useEffect(() => {
    const controller = new AbortController();
    const fetchProfile = async () => {
      try {
        if (!user?.$id) return;
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/user/${user.$id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );
        if (!response.ok) {
          console.warn("fetchProfile non-OK status", response.status);
          return;
        }
        const data = await response.json();
        setProfile(data);
      } catch (error: unknown) {
        if ((error as any)?.name === "AbortError") return;
        console.error("fetchProfile error:", error);
      }
    };
    fetchProfile();

    return () => {
      controller.abort();
    };
  }, [user?.$id]);

  /* ---------------------------
     4) updateLocation API call
     Runs only when:
       - profile?.API_KEY exists
       - location.address.city exists
       - permissionStatus is granted (extra safety)
     Guards prevent calling the API when user denied location
     --------------------------- */
  useEffect(() => {
    if (permissionStatus !== "granted") return;
    if (!profile?.API_KEY) return;
    if (!location?.address?.city) return;

    let cancelled = false;
    const updateLocation = async () => {
      try {
        const result = await globalFunction.fetchWithTimeout(
          `${process.env.EXPO_PUBLIC_BASE_URL}/city`,
          {
            method: "PATCH",
            headers: {
              "content-type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              userId: user?.$id,
              API_KEY: profile.API_KEY,
              city: location?.address?.city,
            }),
          },
          20000
        );

        if (cancelled) return;
        const response = await result.json();
        console.log("updateLocation response:", response);
      } catch (error) {
        if (!cancelled) console.error("Update Location: ", error);
      }
    };

    updateLocation();

    return () => {
      cancelled = true;
    };
  }, [profile?.API_KEY, location?.address?.city, permissionStatus, user?.$id]);

  /* ---------------------------
     5) Push notifications
     - Only attempt if device and profile API available
     - Fail gracefully (no throw)
     --------------------------- */
  useEffect(() => {
    if (!profile?.API_KEY) return;

    let cancelled = false;
    (async () => {
      try {
        const newToken = await registerForPushNotificationsAsync();

        if (!newToken) return;
        if (cancelled) return;

        // Only call insertNotificationToken if token exists and differs
        if (newToken && profile?.pushToken !== newToken) {
          console.log("Token changed — updating server...");
          await insertNotificationToken(newToken);
        }
      } catch (error) {
        if (!cancelled) console.error("Push Notification Setup Error:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profile?.API_KEY]);

  /* ---------------------------
     6) getCachedAddress (fallback loader)
     - Also safe to run once; we already attempted cached load in permission flow,
       but keeping here as a safety net.
     --------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const cachedAddress = await AsyncStorage.getItem("user_address");
        if (cachedAddress && !location?.address) {
          const parsed = JSON.parse(cachedAddress);
          location.setAddress(parsed);
        }
      } catch (e) {
        console.warn("getCachedAddress error", e);
      }
    })();
  }, []);

  /* ---------------------------
     Utility: registerForPushNotificationsAsync
     - Does NOT throw (returns token | null)
     - safe guards for simulator and permission flows
     --------------------------- */
  async function registerForPushNotificationsAsync(): Promise<string | null> {
    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      if (!Device.isDevice) {
        console.warn("Push notifications require a physical device.");
        return null;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.warn(
          "Permission not granted to get push token for push notification!"
        );
        return null;
      }

      const projectId =
        (Constants as any)?.expoConfig?.extra?.eas?.projectId ??
        (Constants as any)?.easConfig?.projectId;
      if (!projectId) {
        console.warn("Project ID not found for notifications.");
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      const pushTokenString = tokenData?.data ?? null;
      return pushTokenString;
    } catch (err) {
      console.error("registerForPushNotificationsAsync error:", err);
      return null;
    }
  }

  /* ---------------------------
     insertNotificationToken
     - Safe, logs errors, won't crash
     --------------------------- */
  const insertNotificationToken = async (pushToken: string) => {
    try {
      if (!profile?.API_KEY) {
        console.warn("Skipping push token upload: missing API_KEY");
        return;
      }
      if (!user?.$id) {
        console.warn("Skipping push token upload: missing user id");
        return;
      }

      const result = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/push-token`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            userId: user.$id,
            token: pushToken,
            API_KEY: profile.API_KEY,
          }),
        },
        20000
      );

      await result.json();
    } catch (error) {
      console.error("insertNotificationToken error:", error);
    }
  };

  /* ---------------------------
     Render
     - While initializing we show a small safe spinner
     - If user denied location we still render the screen (limited features)
     - All effects guarded so nothing will crash
     --------------------------- */
  if (initializing) {
    return (
      <RNFSafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Initializing…</Text>
      </RNFSafeAreaView>
    );
  }

  // At this point the app is usable. If permissionStatus === 'denied',
  // location-dependent features will simply not run (effects are guarded).
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
