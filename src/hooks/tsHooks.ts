import { AppRate, ChatRoom, MyNotifications, Plot, Profile } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { globalFunction } from "../global/fetchWithTimeout";
import { account } from "../lib/appwrite";
import { rateRubberTapAI } from "../action/userAction";
import { Alert } from "react-native";

interface RateParams {
  id: string;
  rating: number;
  feedback: string;
  API_KEY: string;
}

export function useUser() {
  // 1. First, get the account session (Sync hook, Async logic inside)
  const { data: userData } = useQuery({
    queryKey: ["account"],
    queryFn: () => account.get(),
  });

  // 2. Second, fetch the profile only if we have a userData.$id
  const userId = userData?.$id;
  console.log(userId);
  console.log(`http://192.168.1.9:3000/api/v1/users/${userId}`);

  return useQuery<Profile | null>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await globalFunction.fetchWithTimeout(
        `http://192.168.1.9:3000/api/v1/users/${userId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
        25000,
      );

      const result = await response.json();

      console.log(result);

      return result.data;
    },
    // This query won't run until userId exists
    enabled: !!userId,
  });
}

export function getChat() {
  const { data: profile } = useUser();

  const userId = profile?.$id;

  return useQuery<ChatRoom[] | []>({
    queryKey: ["chat-history", userId],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/chat-room/${profile?.$id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data = await response.json();
      return data;
    },
    enabled: !!userId,
  });
}

export function getMyPlot() {
  const { data: profile } = useUser();

  return useQuery<Plot[] | []>({
    queryKey: ["my-plot", profile?.$id],
    queryFn: async () => {
      const response = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/my-plot/${profile?.$id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
        30000,
      );
      const data = await response.json();

      return data;
    },
    enabled: !!profile,
  });
}

export function myNotifications() {
  const { data: profile } = useUser();

  return useQuery<MyNotifications[] | []>({
    queryKey: ["notifications", profile?.$id],
    queryFn: async () => {
      const response = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/notifications`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: profile?.$id,
            API_KEY: profile?.API_KEY,
          }),
        },
        20000,
      );

      const data = await response.json();
      if (data.items === 0) {
        return [];
      }

      const sortedNotifications = [...data].sort((a, b) => {
        return (
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
      });

      return sortedNotifications;
    },
  });
}

export function userRated() {
  const { data: profile } = useUser();
  const userId = profile?.$id;

  return useQuery<AppRate | null>({
    queryKey: ["app-rate", profile?.$id],
    queryFn: async () => {
      try {
        const response = await globalFunction.fetchWithTimeout(
          `${process.env.EXPO_PUBLIC_BASE_URL}/rubbertapai/${profile?.$id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          },
          25000,
        );

        const result = await response.json();

        return result;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    enabled: !!userId,
  });
}

export function useRateAppFetching() {
  const queryClient = useQueryClient(); // Get the client instance

  return useMutation<any, Error, RateParams>({
    mutationFn: async ({ id, rating, feedback, API_KEY }) => {
      return await rateRubberTapAI(id, rating, feedback, API_KEY);
    },
    onSuccess: (_data, variables) => {
      // 2. Use the instance to invalidate
      queryClient.invalidateQueries({
        queryKey: ["app-rate", variables.id], // Note: matches the key in userRated()
      });

      Alert.alert("Success", "Feedback submitted!");
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      Alert.alert("Error", "Something went wrong.");
    },
  });
}
