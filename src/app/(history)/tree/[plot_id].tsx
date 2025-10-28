import { AppText } from "@/src/components/AppText";
import ConfirmCancelModal from "@/src/components/ConfirmOrCancelModal";
import Loading from "@/src/components/LoadingComponent";
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
  const [treeId, setTreeId] = useState("");
  const [modal, setModal] = useState(false);
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [whatModal, setWhatModal] = useState("");
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
      console.error(error);
    } finally {
      setLoading(false);
      MyTrees();
    }
  };

  const deleteTree = async () => {
    try {
      setLoading(true);

      const dataJson = {
        tree_id: treeId,
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
          onPress: () => MyTrees(),
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        className={`${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} flex-1 items-center justify-center`}
      >
        <Loading className="h-16 w-16" />
      </SafeAreaView>
    );
  }

  console.log(myTrees.length);

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className={`flex-1 ${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} p-6`}
      >
        <View className="items-center flex-row justify-between">
          <View className="items-center flex-row gap-5">
            <FontAwesome5
              name="arrow-left"
              size={20}
              onPress={() => router.back()}
              color={theme === "dark" ? `#E8C282` : `black`}
            />
            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className="text-xl font-bold"
            >
              List of Trees
            </AppText>
          </View>
          <TouchableOpacity
            onPress={() => {
              setModal(true);
              setWhatModal("addTree");
            }}
            className={`${theme === "dark" ? `bg-green-700` : `bg-[#75A90A]`} px-4 py-1.5 rounded-full gap-2 flex-row items-center`}
          >
            <AppText
              className={`${theme === "dark" ? `text-[#E2C282]` : `text-white`} text-[14px] font-bold font-poppins`}
            >
              Add Tree
            </AppText>
            <Feather name="plus" size={24} color={"white"} />
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
        <View className="flex-row flex-wrap mb-14">
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
                className={`${theme === "dark" ? `bg-slate-900` : `bg-[#FFD99A]`} mt-5 w-[48%] h-60 mr-2  rounded-lg`}
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
                  <View className="flex-row items-center justify-between">
                    <AppText
                      color={theme === "dark" ? `light` : `dark`}
                      className="font-bold font-poppins text-lg"
                    >
                      Tree {`#${index + 1}`}
                    </AppText>

                    <TouchableOpacity
                      onPress={() => {
                        setModal(true);
                        setTreeId(data?.$id);
                        setWhatModal("deleteTree");
                      }}
                      className="bg-[#75A90A] rounded-xl px-4 py-2 "
                    >
                      <AppText
                        className={`${theme === "dark" ? `text-[#E2C282]` : `text-white`}`}
                      >
                        Delete
                      </AppText>
                    </TouchableOpacity>
                  </View>
                  <AppText color={theme === "dark" ? `light` : `dark`}>
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
        {whatModal === "addTree" && (
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
        )}
        {whatModal === "deleteTree" && (
          <ConfirmCancelModal
            heightSize={60}
            blurIntensity={70}
            borderRounded={10}
            padding={12}
            onCancel={() => setModal(false)}
            onClose={() => setModal(false)}
            onOk={() => {
              setModal(false);
              deleteTree();
            }}
          >
            <AppText
              className=" font-bold font-poppins text-lg m-auto pb-2 text-center"
              color="dark"
            >
              ⚠️ Warning: This will permanently delete the tree and all of its
              contents. This action cannot be undone.
            </AppText>
          </ConfirmCancelModal>
        )}
      </Modal>
    </SafeAreaView>
  );
}
