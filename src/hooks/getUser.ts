import { Profile } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { globalFunction } from "../global/fetchWithTimeout";
import { account } from "../lib/appwrite";

export default function useUser() {
  // 1. First, get the account session (Sync hook, Async logic inside)
  const { data: userData } = useQuery({
    queryKey: ["account"],
    queryFn: () => account.get(),
  });

  // 2. Second, fetch the profile only if we have a userData.$id
  const userId = userData?.$id;
  console.log(userId);

  return useQuery<Profile | null>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/user/${userId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
        25000,
      );

      return await response.json();
    },
    // This query won't run until userId exists
    enabled: !!userId,
  });
}
