import { AppText } from "@/src/components/AppText";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import Loading from "@/src/components/LoadingComponent";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { globalFunction } from "@/src/global/fetchWithTimeout";
import { Leaves_Record, Profile } from "@/types";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Leaves() {
  const params = useLocalSearchParams();
  const [myLeaves, setMyLeaves] = useState<Leaves_Record[]>([]);
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [modal, setModal] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leaf, setLeaf] = useState<Leaves_Record>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/user/${user?.$id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.$id]);

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
      <BackgroundGradient
        className={` flex-1 flex-row items-center justify-center`}
      >
        <Loading className="h-16 w-16 mx-auto" />
      </BackgroundGradient>
    );
  }

  const deleteLeaf = async () => {
    try {
      setLoading(true);

      const dataJson = {
        leaf_id: leaf?.$id,
        API_KEY: profile?.API_KEY,
        userId: profile?.$id,
      };

      console.log("Tree JSON data: ", dataJson);

      const response = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/tree`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify(dataJson),
        },
        20000
      );

      const data = await response.json();
      Alert.alert(data.title, data.message, [
        {
          text: "Ok",
          onPress: () => getMyLeaves(),
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <BackgroundGradient className="flex-1">
        <ScrollView className={`flex-1 `}>
          <View className="flex-1  p-6">
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

            {myLeaves.length > 0 ? (
              <View className="flex-row flex-1 mt-8 gap-4 flex-wrap">
                {myLeaves?.map((data, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      className="bg-[#FFD99A] h-52 rounded-lg w-[47%]"
                      onPress={() => {
                        setLeaf(data);
                        setModal(true);
                      }}
                    >
                      <Image
                        source={{ uri: data?.image_leaf }}
                        className="h-[75%] w-full"
                      />
                      <View className="p-2 flex-row justify-between">
                        <AppText
                          color="dark"
                          className="font-poppins font-bold text-lg mt-1.5 mx-2"
                        >
                          Leaf #{index + 1}
                        </AppText>

                        <TouchableOpacity
                          onPress={deleteLeaf}
                          className="bg-[#75A90A] rounded-xl px-4 py-2 "
                        >
                          <AppText
                            className={`${theme === "dark" ? `text-[#E2C282]` : `text-white`}`}
                          >
                            Delete
                          </AppText>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <AppText
                className="font-poppins mt-20 mx-auto font-bold text-xl"
                color={theme === "dark" ? "light" : "dark"}
              >
                There are no leaves uploaded yet.
              </AppText>
            )}
          </View>
        </ScrollView>
      </BackgroundGradient>
      <Modal onRequestClose={() => setModal(false)} visible={modal} transparent>
        <View className="flex-1 bg-black/85 items-center justify-center gap-10">
          <View className="w-full px-10">
            <Feather
              name="x"
              size={32}
              color="white"
              onPress={() => setModal(false)}
            />
          </View>
          <Image
            source={{ uri: leaf?.image_leaf }}
            className="h-[70%] w-[80%] rounded-md"
          />
          <AppText className="text-xl font-poppins">
            Status: {leaf?.status}
          </AppText>
          <AppText>
            Probability:{" "}
            {parseFloat(String(leaf?.confidence ?? 0 * 100)).toFixed(3)}
          </AppText>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
