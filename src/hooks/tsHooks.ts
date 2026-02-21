import {
  AppRate,
  ChatRoom,
  MyNotifications,
  Plot,
  Profile,
  Tree_Record,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { globalFunction } from "../global/fetchWithTimeout";
import { account } from "../lib/appwrite";
import { rateRubberTapAI } from "../action/userAction";
import { Alert, BackHandler } from "react-native";
import dayjs from "dayjs";

export interface AuthPayload {
  userId: string;
  API_KEY: string;
}

// Now use Intersections for specific mutations
export type RateParams = AuthPayload & { rating: number; feedback: string };

export function useUser() {
  // 1. First, get the account session (Sync hook, Async logic inside)
  const { data: userData } = useQuery({
    queryKey: ["account"],
    queryFn: () => account.get(),
  });

  // 2. Second, fetch the profile only if we have a userData.$id
  const userId = userData?.$id;
  console.log(userId);
  console.log(`http://192.168.1.16:3000/api/v1/users/${userId}`);

  return useQuery<Profile | null>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;

      const controller = new AbortController();

      // The "Bomb": Exits app if it reaches 10s
      const timeoutId = setTimeout(() => {
        controller.abort();
        Alert.alert("Connection Timeout", "Server unreachable. Closing app.", [
          { text: "OK", onPress: () => BackHandler.exitApp() },
        ]);
      }, 20000);

      const response = await globalFunction.fetchWithTimeout(
        `http://192.168.1.16:3000/api/v1/users/${userId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
        10000,
      );

      const result = await response.json();
      clearTimeout(timeoutId);

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

      const convert = data.map((doc: Plot) => ({
        ...doc,
        $createdAt: dayjs(doc?.$createdAt),
      }));

      return convert;
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
  const queryClient = useQueryClient();
  return useMutation<any, Error, RateParams>({
    mutationFn: async (params) => {
      // We pass the whole object to the action
      return await rateRubberTapAI(
        params.userId,
        params.rating,
        params.feedback,
        params.API_KEY,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["app-rate", variables.userId],
      });
      Alert.alert("Success", "Thank you for your feedback!");
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      Alert.alert("Error", "Something went wrong.");
    },
  });
}

export function getMyTree(plotId: string) {
  const { data: profile } = useUser();

  const userId = profile?.$id;
  console.log("User Id in get my tree", userId);

  console.log(plotId);

  return useQuery<Tree_Record[] | []>({
    queryKey: ["tree-record", userId],
    queryFn: async () => {
      try {
        if (!userId) return [];

        const response = await globalFunction.fetchWithTimeout(
          `${process.env.EXPO_PUBLIC_BASE_URL}/trees/${plotId}/${userId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          },
          20000,
        );

        const result = await response.json();

        if (result.length === 0) {
          return [];
        }

        const convert = result.map((data: Tree_Record) => ({
          ...data,
          $createdAt: dayjs(data?.$createdAt),
        }));

        return convert;
      } catch (error) {
        console.error(error);
        return;
      }
    },
    enabled: !!userId && !!plotId,
  });
}

export function useDeleteTreeMutation(
  userId: string | undefined,
  API_KEY: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { tree_id: string }>({
    mutationFn: async ({ tree_id }) => {
      await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/tree`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tree_id,
            userId,
            API_KEY,
          }),
        },
        20000,
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tree-record", userId],
      });
    },
  });
}

export function addTreeMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { plot_id: string; userId: string | undefined; API_KEY: string | undefined }
  >({
    mutationFn: async ({ plot_id, userId, API_KEY }) => {
      await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/trees`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, plot_id, API_KEY }),
        },
        20000,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tree-record", variables.userId],
        exact: true,
      });
    },
  });
}
