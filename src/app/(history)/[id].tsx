import { AppText } from "@/src/components/AppText";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { globalFunction } from "@/src/global/fetchWithTimeout";
import { Plot, Tree_Record } from "@/types";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ListTrees() {
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const [myTrees, setMyTrees] = useState<Tree_Record[]>([]);
  const [tree, setTree] = useState<Tree_Record | null>(null);
  const [myPlot, setMyPlot] = useState<Plot | null>(null);
  const [modal, setModal] = useState(false);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user?.$id || !params?.id) return;

    const MyTrees = async () => {
      try {
        const response = await globalFunction.fetchWithTimeout(
          `${process.env.EXPO_PUBLIC_BASE_URL}/my-trees/${user?.$id}/${params?.id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
          30000
        );

        const data = await response.json();
        const convert = data.map((doc: Tree_Record) => ({
          ...doc,
          $createdAt: dayjs(doc.$createdAt),
        }));


        setMyTrees(convert);
      } catch (error) {
        console.error(error);
        return [];
      } finally {
        setLoading(false);
      }
    };
    MyTrees();
  }, [user?.$id, params.id]);

  useEffect(() => {
    if (!user?.$id || !params?.id) return;

    const MyPlot = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/my-plot/${user?.$id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        setMyPlot(data);
      } catch (error) {
        console.error(error);
        return [];
      } finally {
        setLoading(false);
      }
    };
    MyPlot();
  }, [params.id]);

  if (loading) {
    return (
      <SafeAreaView
        className={`${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} flex-1 items-center justify-center`}
      >
        <ActivityIndicator animating size={"large"} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className={`flex-1 ${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} p-6`}
      >
        <View className="items-center flex-row mb-4 gap-5">
          <FontAwesome5
            name="arrow-left"
            size={20}
            onPress={() => router.back()}
            color={theme === "dark" ? `white` : `black`}
          />
          <AppText
            color={theme === "dark" ? `light` : `dark`}
            className="text-xl font-bold"
          >
            History Logs
          </AppText>
        </View>
        <View className="items-center flex-row">
          <View className="items-center flex-row gap-4">
            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className="text-lg font-bold"
            >
              {myPlot?.name}
            </AppText>
            <AppText color={theme === "dark" ? `light` : `dark`} className="">
              {"(List Of trees)"}
            </AppText>
          </View>
        </View>
        <View className="flex-row flex-wrap">
          {myTrees?.map((data, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setTree(data);
                  setModal(true);
                }}
                style={{
                  boxShadow:
                    "1px 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                }}
                className="mt-5 w-[48%] h-60 mr-2 bg-[#FFD99A] rounded-lg"
              >
                <Image
                  style={{
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                  source={{ uri: data?.image_url }}
                  className="h-[55%]"
                />
                <View className="flex-row items-center justify-between p-2 ">
                  <AppText
                    color="dark"
                    className="font-bold font-poppins text-lg"
                  >
                    Tree {`#${index + 1}`}
                  </AppText>
                  <AppText color="dark">
                    {data?.$createdAt.format("MM/DD/YYYY")}
                  </AppText>
                </View>
                <AppText color={`dark`} className="items-center flex-row mx-3">
                  {data?.status}
                  {":"} {String(data?.confidence)}
                  {"%"}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <Modal visible={modal} onRequestClose={() => setModal(false)} transparent>
        <View className="bg-black/80 flex-1 p-6">
          <Feather
            name="x"
            size={24}
            className=" place-self-end mt-5"
            color={"white"}
            onPress={() => setModal(false)}
          />
          <Image
            className="mt-5 mx-auto rounded-md h-[70%] w-full"
            source={{ uri: tree?.image_url }}
          />

          <View
            className={`my-auto ${tree?.status === "Healthy" ? `bg-green-500` : `bg-red-600`} px-6 py-2 w-[95%] mx-auto rounded-lg`}
          >
            <AppText
              className="font-poppins text-xl mb-4 font-bold"
              color="light"
            >
              Details:{" "}
            </AppText>
            <View className="gap-2 mx-7 mb-1">
              <AppText
                color="light"
                className={`font-poppins text-lg font-bold tracking-wide `}
              >
                Status: {tree?.status}
              </AppText>
              <AppText color="light" className="font-poppins">
                Confidence: {tree?.confidence.toString()} %
              </AppText>
              <AppText color="light" className="font-poppins">
                Captured at: {tree?.$createdAt.format("MMMM DD, YYYY")}
              </AppText>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
