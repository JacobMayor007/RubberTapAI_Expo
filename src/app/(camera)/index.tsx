import { saveTreeToPlot } from "@/src/action/treeAction";
import { AppText } from "@/src/components/AppText";
import Loading from "@/src/components/LoadingComponent";
import RegisterPlot from "@/src/components/RegisterTreePlot";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Plot, Profile } from "@/types";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import dayjs from "dayjs";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Link, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Prediction = {
  className: string;
  probability: number;
};

type TMResponse = {
  predictions: Prediction[];
  error?: string;
  tfjsVersion?: string;
  tmVersion?: string;
};

export default function CameraLeaf() {
  const [flash, setFlash] = useState<"off" | "on">("off");
  const cameraRef = useRef<CameraView>(null);
  const [resultModal, setResultModal] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const [results, setResults] = useState<TMResponse | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { theme } = useTheme();
  const [saveModal, setSaveModal] = useState(false);
  const [registerModal, setRegisterModal] = useState(false);
  const [myPlot, setMyPlot] = useState<Plot[]>([]);
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>();
  const [takes, setTakes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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
      }
    };
    fetchProfile();
  }, [user?.$id]);

  useEffect(() => {
    const MyPlot = async () => {
      try {
        setPageLoading(true);

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

        if (data.length < 1) {
          Alert.alert(
            "No Registered Plot",
            "Please register plot first to use camera leaf detection!",
            [
              {
                text: "OK",
                onPress: () => router.navigate("/(tabs)/history"),
                style: "default",
              },
            ]
          );
        }

        setMyPlot(data);
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setPageLoading(false);
      }
    };
    MyPlot();
  }, [user?.$id]);

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    // Check permissions first
    if (!permission?.granted) {
      await requestPermission();
      if (!permission?.granted) return;
    }

    // Check limit
    if (takes >= 25) {
      Alert.alert("Captured Limit", "You have used your free tier.");
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo?.uri) {
        setUri(photo.uri);
        await uploadImage(photo.uri);
      }
    } catch (error) {
      console.log("Error taking photo:", error);
    }
  };

  const pickAnImage = async () => {
    try {
      if (takes >= 25) {
        Alert.alert("Captured Limit", "You have used your free tier.");
        return;
      }

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("Permission to access camera roll is required!");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        quality: 1,
        aspect: [1, 1],
      });

      if (!result.canceled) {
        const selectedUris = result.assets[0].uri;
        setUri(selectedUris);
        await uploadImage(selectedUris);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const uploadImage = async (uri: string) => {
    setResultModal(true);

    const formData = new FormData();
    formData.append("image", {
      uri,
      name: "photo.jpg",
      type: "image/jpeg",
    } as any);

    try {
      setLoading(true);
      const response = await fetch(
        "https://rubbertapai-server-1.onrender.com/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Upload error:", error);
      setResults({
        error: error instanceof Error ? error.message : "Prediction failed",
        predictions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTree = async (plot_id: string, name: string) => {
    try {
      setLoading(true);
      const status = results?.predictions.reduce(
        (max: Prediction, item: Prediction) =>
          item.probability > max.probability ? item : max,
        { probability: 0, className: "" }
      ).className;
      const plot_name = name;

      const confidence = results?.predictions?.[0]
        ? parseFloat((results.predictions[0].probability * 100).toFixed(2))
        : 0;

      console.log(confidence);

      const data = await saveTreeToPlot(
        user?.$id || "",
        plot_id,
        uri || "",
        status || "",
        plot_name,
        profile?.API_KEY || "",
        confidence
      );

      if (data) {
        console.log(status);

        console.log("Successful");
        console.log(data);

        Alert.alert(data.title, data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      router.reload();
    }
  };

  if (pageLoading) {
    return (
      <SafeAreaView
        style={{
          flexGrow: 1,
          backgroundColor: "#FFECCC",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loading className="h-12 w-12" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }}>
      <CameraView
        style={{
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
        mode="picture"
        ref={cameraRef}
        facing="back"
        flash={flash}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingTop: 40,
          }}
        >
          <Feather
            name="x"
            size={30}
            color={"white"}
            onPress={() => router.push("/(tabs)")}
          />
          <Ionicons
            name={flash === "off" ? "flash-off" : "flash"}
            size={30}
            color={"white"}
            onPress={() => setFlash((prev) => (prev === "off" ? "on" : "off"))}
          />
        </View>
        <View className="bg-black/40 h-32 items-center justify-center flex-row">
          <Pressable
            onPress={pickAnImage}
            className="absolute left-[18%] h-14 w-14 bg-white rounded-full items-center justify-center"
          >
            <Entypo name="folder-images" size={24} />
          </Pressable>

          <Pressable
            style={{
              height: 60,
              width: 60,
              borderRadius: "50%",
              backgroundColor: "white",
              padding: 2,
            }}
            onPress={takePhoto}
          >
            <View
              style={{
                borderWidth: 2,
                borderColor: "black",
                borderRadius: "50%",
                flexGrow: 1,
              }}
            />
          </Pressable>
          <Pressable className="absolute left-[68%] gap-1">
            <View className="flex-row items-center gap-2">
              <FontAwesome5 name="crown" size={28} color={"yellow"} />
              <TouchableOpacity
                style={{ transform: "skewX(-10deg)" }}
                className="font-poppins p-2  font-bold bg-gray-600"
              >
                <Text
                  style={{
                    color: "white",
                    fontFamily: "Poppins",
                    fontWeight: 900,
                  }}
                >
                  {!takes ? 0 : takes}/25 Scan
                </Text>
              </TouchableOpacity>
            </View>
            <Link href={{ pathname: "/(camera)/payment" }}>
              <AppText
                color={"light"}
                className="font-poppins text-center tracking-widest font-bold  underline"
              >
                Get Unlimited
              </AppText>
            </Link>
          </Pressable>
        </View>
      </CameraView>

      <Modal
        style={{
          flexGrow: 1,
          backgroundColor: theme === "dark" ? "#111827" : "#FFECCC",
        }}
        animationType="slide"
        visible={resultModal}
        transparent={!results ? true : false}
        onRequestClose={() => setResultModal(false)}
      >
        {loading ? (
          <View className="flex-1 bg-black/50">
            <Feather
              name="x"
              size={30}
              color={"white"}
              onPress={() => {
                setResultModal(false);
                setResults(null);
                setUri(null);
              }}
            />
            <View className="flex-1 justify-center items-center flex-col ">
              <ActivityIndicator size={"large"} />
              <AppText>Analyzing Images</AppText>
            </View>
          </View>
        ) : (
          <View
            className={`flex-1 justify-between border ${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} px-16 `}
          >
            <View>
              <Image
                style={{
                  width: 300,
                  height: 300,
                  marginVertical: 20,
                  borderRadius: 30,
                }}
                source={{ uri: uri || "" }}
              />

              <View className="items-center">
                {results && (
                  <View style={{ marginTop: 20 }}>
                    {results.error ? (
                      <Text style={{ color: "red" }}>
                        Error: {results.error}
                      </Text>
                    ) : (
                      <>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            textAlign: "center",
                            color: theme === "dark" ? "white" : "black",
                          }}
                        >
                          Results:
                        </Text>
                        {results.predictions?.map(
                          (item: Prediction, index: number) => (
                            <Text
                              className={
                                theme === `dark` ? `text-white` : `text-black`
                              }
                              key={index}
                            >
                              {item.className}:{" "}
                              {(item.probability * 100).toFixed(2)}%
                            </Text>
                          )
                        )}
                        {results.predictions &&
                          results.predictions.length > 0 && (
                            <Text
                              style={{
                                marginTop: 10,
                                fontFamily: "Poppins",
                                fontWeight: 900,
                                fontSize: 18,
                                color: theme === "dark" ? "white" : "black",
                              }}
                            >
                              Detected:{" "}
                              {
                                results.predictions.reduce(
                                  (max: Prediction, item: Prediction) =>
                                    item.probability > max.probability
                                      ? item
                                      : max,
                                  { probability: 0, className: "" }
                                ).className
                              }
                            </Text>
                          )}
                      </>
                    )}
                  </View>
                )}
              </View>
              <AppText
                color={theme === "dark" ? `light` : `dark`}
                className="font-extrabold text-lg font-poppins mt-10"
              >
                Method: Leaf Disease Detection
              </AppText>
              <AppText
                color={theme === "dark" ? `light` : `dark`}
                className="font-bold font-poppins"
              >
                Date: {dayjs().format("MMMM DD, YYYY hh:mm A")}
              </AppText>
            </View>

            <View
              className={`pb-5 ${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} items-end `}
            >
              <TouchableOpacity
                onPress={() => {
                  setSaveModal(true);
                  setResultModal(false);
                }}
                className={`${theme === "dark" ? `bg-green-500` : `bg-gray-500`} rounded-lg h-12 px-4  items-center justify-center`}
              >
                <Text
                  style={{
                    fontWeight: 700,
                    color: "white",
                  }}
                  className="font-poppins"
                >
                  Save To Record?
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
      <Modal
        visible={saveModal}
        animationType="fade"
        onRequestClose={() => setSaveModal(false)}
        className={`flex-1`}
      >
        <View
          className={`${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} flex-1 p-6 `}
        >
          <FontAwesome5
            name="arrow-left"
            size={20}
            onPress={() => setSaveModal(false)}
          />
          <View className="flex-row items-center justify-between mt-5 ">
            <Text
              className={`font-poppins text-lg font-bold ${theme === "dark" ? `text-white` : `text-black`}`}
            >
              Save To Tree Records
            </Text>
            <TouchableOpacity
              onPress={() => {
                myPlot.length === 3 && !profile?.subscription
                  ? Alert.alert(
                      "We're sorry, but you used up all your Free Tier Plot Register. Subscribe to have unlimited Register Tree Plots"
                    )
                  : setSaveModal(false);
                setRegisterModal(true);
              }}
              className={`${theme === "dark" ? `bg-slate-500` : `bg-green-500`}  h-11 px-7 gap-4 rounded-full items-center flex-row justify-center`}
            >
              <Text className="text-white font-bold text-center">
                Register{`\n`}Tree Plot
              </Text>
              <Feather name="plus-circle" size={24} color={"white"} />
            </TouchableOpacity>
          </View>

          {myPlot.length < 1 && (
            <AppText
              className="m-auto font-bold text-lg pb-2"
              color={theme === "dark" ? `light` : `dark`}
            >
              You have no Tree Plot Registered yet
            </AppText>
          )}

          {myPlot.length > 0 && (
            <ScrollView className="mt-6 flex-1 ">
              <View>
                <Text
                  style={{ fontWeight: 700 }}
                  className={`${theme === "dark" ? `text-white` : `text-black`} mb-6 text-lg tracking-wide`}
                >
                  Select Tree Plots
                </Text>
                {myPlot.map((data, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => saveTree(data.$id, data.name)}
                    style={{
                      boxShadow:
                        "1px 1px 1px 1px rgba(0, 0, 0, 0.2), 0 6px 15px 0 rgba(0, 0, 0, 0.19)",
                    }}
                    className="w-[47%] h-52  mr-4 rounded-lg"
                  >
                    {data?.image_plot ? (
                      <Image
                        source={{ uri: data?.image_plot }}
                        style={{
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                        }}
                        className="h-[60%]"
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
                    <AppText
                      className="m-4 text-lg pb-0.5 font-bold font-poppins"
                      color={theme === "dark" ? `light` : `dark`}
                    >
                      {data?.name}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
      <Modal visible={registerModal} animationType="slide" transparent>
        <RegisterPlot
          setRegisterModal={setRegisterModal}
          setSaveModal={setSaveModal}
        />
      </Modal>
    </SafeAreaView>
  );
}
