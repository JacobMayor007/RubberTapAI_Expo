import { AppText } from "@/src/components/AppText";
import ConfirmCancelModal from "@/src/components/ConfirmOrCancelModal";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { globalFunction } from "@/src/global/fetchWithTimeout";
import { Profile, Tree_Record } from "@/types";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  const [modal, setModal] = useState(false);
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    MyTrees();
  }, []);

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

  const MyTrees = async () => {
    try {
      setLoading(true);

      const response = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/trees/${params?.plot_id}/${user?.$id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
        20000
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

  const addTree = async () => {
    try {
      setLoading(true);

      const data = {
        userId: user?.$id,
        plot_id: params?.plot_id,
        API_KEY: profile?.API_KEY,
      };

      const response = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/trees`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify(data),
        },
        20000
      );

      const result = await response.json();

      Alert.alert(result.title, result.message);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        className={`${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} flex-1 items-center justify-center`}
      >
        <ActivityIndicator animating size={"large"} />
      </SafeAreaView>
    );
  }

  console.log(myTrees);

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className={`flex-1 ${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} p-6`}
      >
        <View className="items-center flex-row mb-4 justify-between">
          <View className="items-center flex-row gap-5">
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
              List of Trees
            </AppText>
          </View>
          <TouchableOpacity
            onPress={() => setModal(true)}
            className="bg-green-500 px-4 py-1 rounded-full gap-2 flex-row items-center"
          >
            <AppText
              color={`light`}
              className="text-[14px] font-bold font-poppins"
            >
              Add Tree
            </AppText>
            <Feather name="plus-circle" size={24} color={"white"} />
          </TouchableOpacity>
        </View>
        <View className="items-center flex-row">
          {myTrees.length === 0 && (
            <View className="justify-center mx-auto mt-20">
              <AppText color="dark" className="font-poppins font-bold text-lg">
                You have no trees that have been registered
              </AppText>
            </View>
          )}
        </View>
        <View className="flex-row flex-wrap">
          {myTrees?.map((data, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  router.push({
                    pathname: "/(history)/[plot_id]/[tree]",
                    params: {
                      plot_id: String(params?.plot_id),
                      tree: data?.$id,
                    },
                  })
                }
                style={{
                  boxShadow:
                    "1px 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                }}
                className="mt-5 w-[48%] h-60 mr-2 bg-[#FFD99A] rounded-lg"
              >
                {data?.image_url ? (
                  <Image
                    style={{
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                    }}
                    src={data?.image_url}
                    className="h-[55%]"
                  />
                ) : (
                  <View
                    className={`h-[60%] items-center justify-center px-2 rounded-s-lg ${theme === "dark" ? `bg-slate-200` : `bg-slate-500`}`}
                  >
                    <AppText
                      color={theme === "dark" ? `dark` : `light`}
                      className="text-center"
                    >
                      There are no leaves yet
                    </AppText>
                  </View>
                )}
                <View className="flex-col  p-2 ">
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
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <Modal
        visible={modal}
        animationType="slide"
        onRequestClose={() => setModal(false)}
        transparent
      >
        <ConfirmCancelModal
          heightSize={60}
          blurIntensity={70}
          borderRounded={10}
          padding={12}
          onCancel={() => setModal(false)}
          onClose={() => setModal(false)}
          onOk={() => {
            setModal(false);
            addTree();
          }}
        >
          <AppText
            className="m-auto pb-4 font-bold font-poppins text-xl"
            color="dark"
          >
            Confirmation on adding trees
          </AppText>
        </ConfirmCancelModal>
      </Modal>
    </SafeAreaView>
  );
}
