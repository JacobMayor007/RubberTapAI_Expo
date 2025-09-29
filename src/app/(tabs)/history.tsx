import { deletePlot, editPlot } from "@/src/action/plotAction";
import { AppText } from "@/src/components/AppText";
import ConfirmCancelModal from "@/src/components/ConfirmOrCancelModal";
import HeaderBackground from "@/src/components/HeaderBackground";
import Loading from "@/src/components/LoadingComponent";
import NavigationBar from "@/src/components/Navigation";
import RegisterPlot from "@/src/components/RegisterTreePlot";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { globalFunction } from "@/src/global/fetchWithTimeout";
import { Plot, Profile } from "@/types";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function History() {
  const [myPlot, setMyPlot] = useState<Plot[]>([]);
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [registerModal, setRegisterModal] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [ediDelID, setEdiDelID] = useState("");
  const [updatePlot, setUpdatePlot] = useState("");
  const [modal, setModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [editDelete, setEditDelete] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    MyPlot();
    setRefresh(false);
    setSaveModal(false);
  }, [refresh, saveModal]);

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

  const MyPlot = async () => {
    try {
      setLoading(true);
      const response = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/my-plot/${user?.$id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
        30000
      );
      const data = await response.json();
      setMyPlot(data);
    } catch (error: any) {
      if (error === "TimeoutError") {
        Alert.alert(
          "Timeout Error",
          "Internet connectivity is slow, please try again!"
        );
      }

      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        className={`${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} flex-1 flex-row items-center justify-center`}
      >
        <Loading className="h-12 w-12" />
      </SafeAreaView>
    );
  }

  const onOk = async () => {
    try {
      setModal(false);
      const response = await deletePlot(
        ediDelID,
        profile?.$id || "",
        profile?.API_KEY || ""
      );

      const data = response;

      Alert.alert(`${data.status}`, `${data.message}`);
    } catch (error) {
      console.error(error);
    } finally {
      setModal(false);
      setEdiDelID("");
      setRefresh(true);
    }
  };

  const updateHandle = async () => {
    try {
      setLoading(true);

      await editPlot(
        user?.$id || "",
        ediDelID,
        updatePlot,
        profile?.API_KEY || ""
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefresh(true);
      setModal(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 flex-col justify-between">
      <View
        className={` flex-1 ${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`}`}
      >
        <HeaderBackground />
        <View className={`flex-1  p-6 z-20`}>
          <View className="items-center flex-row mb-4 justify-between">
            <View className="flex-row items-center gap-5">
              <FontAwesome5
                name="arrow-left"
                size={28}
                onPress={() => router.back()}
              />
              <AppText
                color={theme === "dark" ? `light` : `dark`}
                className="text-xl font-bold"
              >
                History Logs
              </AppText>
            </View>
            <TouchableOpacity
              onPress={() => setRegisterModal(true)}
              className="bg-green-500 px-4 py-1 rounded-full gap-2 flex-row items-center"
            >
              <AppText color={`light`} className="text-[14px] font-poppins">
                Add Plot
              </AppText>
              <Feather name="plus-circle" size={24} color={"white"} />
            </TouchableOpacity>
          </View>
          {myPlot?.length < 1 ? (
            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className="font-poppins text-lg font-bold mt-4 mx-auto"
            >
              You have no history logs yet
            </AppText>
          ) : (
            <Text
              style={{ fontWeight: 700 }}
              className={`${theme === "dark" ? `text-white` : `text-black`} mb-6  tracking-wide`}
            >
              Select Tree Plots
            </Text>
          )}
          <ScrollView
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            {myPlot?.map((data, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  boxShadow:
                    "2px 4px 1px 1px rgba(255, 255, 255, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                }}
                className="w-[47%] h-64 rounded-lg relative"
                onPress={() => {
                  {
                    router.push({
                      pathname: "/(history)/tree/[plot_id]",
                      params: { plot_id: data?.$id },
                    });
                  }
                }}
              >
                {data?.image_plot ? (
                  <Image
                    className="h-[60%]"
                    style={{
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                    }}
                    source={{ uri: data.image_plot }}
                  />
                ) : (
                  <View
                    className={`h-[60%] items-center justify-center px-2 rounded-s-lg ${theme === "dark" ? `bg-slate-200` : `bg-slate-500`}`}
                  >
                    <AppText
                      color={theme === "dark" ? `dark` : `light`}
                      className="text-center"
                    >
                      No Tree Registered on {data?.name} yet
                    </AppText>
                  </View>
                )}
                <View className="flex-row justify-between items-center pr-4">
                  <AppText
                    className="m-4 text-lg pb-0.5 font-bold font-poppins"
                    color={theme === "dark" ? `light` : `dark`}
                  >
                    {data?.name}
                  </AppText>
                  <TouchableOpacity
                    onPress={() => {
                      setModal(true);
                      setEditDelete("edit");
                      setEdiDelID(data?.$id);
                    }}
                  >
                    <MaterialIcons
                      name="edit"
                      color={theme === "dark" ? "blue" : "black"}
                      size={24}
                    />
                  </TouchableOpacity>
                </View>
                <View className="absolute right-4 bottom-2 flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      setModal(true);
                      setEdiDelID(data?.$id);
                      setEditDelete("delete");
                    }}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      color={"red"}
                      size={24}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <NavigationBar active="history" />
      </View>

      {/* Navigation */}

      <Modal visible={registerModal} transparent>
        <RegisterPlot
          setRegisterModal={setRegisterModal}
          setSaveModal={setSaveModal}
        />
      </Modal>
      <Modal visible={modal} onRequestClose={() => setModal(false)} transparent>
        {editDelete === "delete" && (
          <ConfirmCancelModal
            borderRounded={10}
            heightSize={48}
            blurIntensity={50}
            padding={18}
            onCancel={() => setModal(false)}
            onClose={() => setModal(false)}
            onOk={onOk}
          >
            <AppText
              color={theme === "dark" ? `light` : `dark`}
              className="font-poppins font-bold text-lg tracking-wide"
            >
              Do you really want to delete this plot?
            </AppText>
          </ConfirmCancelModal>
        )}
        {editDelete === "edit" && (
          <ConfirmCancelModal
            onCancel={() => setModal(false)}
            onClose={() => setModal(false)}
            onOk={updateHandle}
            blurIntensity={50}
            padding={18}
            borderRounded={10}
            heightSize={72}
          >
            <View className="gap-2">
              <AppText
                className="font-bold"
                color={theme === "dark" ? `light` : `dark`}
              >
                New Name:
              </AppText>
              <TextInput
                onChangeText={(e) => setUpdatePlot(e)}
                placeholder="Input new name of your plot"
                placeholderTextColor={"#708993"}
                className="w-full h-12 border-[1px] text-[#19183B] rounded-md"
              />
            </View>
          </ConfirmCancelModal>
        )}
      </Modal>
    </SafeAreaView>
  );
}
