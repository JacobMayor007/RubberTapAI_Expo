import { useAuth } from "@/src/contexts/AuthContext";
import { Redirect, Slot } from "expo-router";

export default function Layout() {
  const { user } = useAuth();

  if (!user) {
    <Redirect href={"/(auth)"} />;
  }

  return <Slot />;
}
