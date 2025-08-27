import { useAuth } from "@/src/contexts/AuthContext";
import { Redirect, Slot } from "expo-router";
import { useEffect } from "react";

export default function Layout() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email !== null) {
      console.log(user?.email);

      <Redirect href={{ pathname: "/(tabs)" }} />;
    } else {
      <Redirect href={{ pathname: "/(auth)" }} />;
    }
  }, [user?.email]);

  return <Slot />;
}
