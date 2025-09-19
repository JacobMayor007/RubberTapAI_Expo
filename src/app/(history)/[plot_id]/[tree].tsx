import { AppText } from "@/src/components/AppText";
import Loading from "@/src/components/LoadingComponent";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { globalFunction } from "@/src/global/fetchWithTimeout";
import { Leaves_Record } from "@/types";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Leaves() {
  const params = useLocalSearchParams();
  const [myLeaves, setMyLeaves] = useState<Leaves_Record[]>();
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getMyLeaves();
  }, []);

  const getMyLeaves = async () => {
    try {
      setLoading(true);

      const response = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/my-leaves/${params?.plot_id}/${params?.tree}/${user?.$id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
        20000
      );

      const data = await response.json();
      setMyLeaves(data);
    } catch (error) {
      console.error(error);
      
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1 bg-[#FFECCC] items-center justify-center">
          <Loading className="h-16 w-16" />
        </View>
      </SafeAreaView>
    );
  }

  console.log(myLeaves);

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 bg-[#FFECCC] p-6">
        <View className="flex-row items-center gap-5">
          <FontAwesome5
            name="arrow-left"
            size={20}
            onPress={() => router.back()}
          />
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="text-xl font-bold"
          >
            History Logs
          </AppText>
        </View>

        {myLeaves?.length === 0 && (
          <AppText
            className="font-poppins font-bold m-auto text-xl"
            color="dark"
          >
            There are no leaves uploaded yet.
          </AppText>
        )}

        {myLeaves?.map((data, index) => {
          return (
            <TouchableOpacity key={index}>
              <Image src={data?.image_leaf} className="h-36 w-36" />
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
