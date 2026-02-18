import { AppText } from "@/src/components/AppText";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import ConfirmCancelModal from "@/src/components/ConfirmOrCancelModal";
import Loading from "@/src/components/LoadingComponent";
import { useTheme } from "@/src/contexts/ThemeContext";
import { globalFunction } from "@/src/global/fetchWithTimeout";
import {
  addTreeMutation,
  getMyTree,
  useDeleteTreeMutation,
  useUser,
} from "@/src/hooks/tsHooks";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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
  const plot_id = String(params?.plot_id);
  const { theme } = useTheme();
  const [treeId, setTreeId] = useState("");
  const [modal, setModal] = useState(false);
  const [whatModal, setWhatModal] = useState("");
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useUser();
  const { data: myTrees, isLoading: myTreesLoading } = getMyTree(plot_id);

  const { mutate } = useDeleteTreeMutation(profile?.$id, profile?.API_KEY);
  const { mutate: addTreeQuery } = addTreeMutation();
  const addTree = async () => {
    addTreeQuery(
      { plot_id, userId: profile?.$id, API_KEY: profile?.API_KEY },
      {
        onSuccess: () => {
          Alert.alert(
            "Add Tree Successful",
            "You have successfully added a new tree",
          );
        },
      },
    );
  };

  const deleteTree = async (treeId: string) => {
    mutate(
      { tree_id: treeId },
      {
        onSuccess: () => {
          Alert.alert("Successful", "Deleted Successful");
        },
      },
    );
  };

  if (profileLoading || myTreesLoading) {
    return (
      <BackgroundGradient
        className={` flex-1 flex-row items-center justify-center`}
      >
        <Loading className="h-16 w-16 mx-auto" />
      </BackgroundGradient>
    );
  }

  console.log(myTrees?.length);

  return (
    <SafeAreaView className="flex-1">
      <BackgroundGradient className="flex-1">
        <ScrollView className={`flex-1  p-6`}>
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
              className={` bg-[#75A90A] px-4 py-1.5 rounded-full gap-2 flex-row items-center`}
            >
              <AppText
                className={`text-white text-[14px] font-bold font-poppins`}
              >
                Add Tree
              </AppText>
              <Feather name="plus" size={24} color={"white"} />
            </TouchableOpacity>
          </View>
          <View className="items-center flex-row">
            {myTrees?.length === 0 && (
              <View className="justify-center mx-auto mt-20">
                <AppText
                  color={theme === "dark" ? `light` : `dark`}
                  className="font-poppins font-bold text-lg"
                >
                  You have no trees that have been registered
                </AppText>
              </View>
            )}
          </View>
          <View className="flex-row flex-wrap mb-14">
            {myTrees?.map((data, index) => {
              return (
                <TouchableOpacity
                  key={data?.$id}
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
                      source={{ uri: data?.image_url }}
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
                        <AppText className={`text-white`}>Delete</AppText>
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
      </BackgroundGradient>

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
              color={theme === "dark" ? `light` : `dark`}
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
              deleteTree(treeId);
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
