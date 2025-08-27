import { useAuth } from "@/src/contexts/AuthContext";
import { Redirect, Slot, useRouter } from "expo-router";

export default function Layout() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    <Redirect href={{ pathname: "/(auth)" }} />;
  }

  return <Slot />;
}
