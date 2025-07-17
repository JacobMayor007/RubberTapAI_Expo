import { useAuth } from "@/src/contexts/AuthContext";
import { Slot, useRouter } from "expo-router";

export default function Layout() {
  const { user } = useAuth();
  const router = useRouter();

  if (user?.email !== null) {
    console.log(user?.email);

    router.push("/(tabs)");
  } else {
    router.push("/(auth)");
  }
  return <Slot />;
}
