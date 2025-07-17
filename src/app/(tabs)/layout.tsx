import { useAuth } from "@/src/contexts/AuthContext";
import { router, Slot } from "expo-router";
import { useEffect } from "react";

export default function TabLayout() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isReady) {
      if (!auth.user?.$id) {
        router.replace("/(auth)");
      }
    }
  }, [auth]);

  return <Slot />;
}
