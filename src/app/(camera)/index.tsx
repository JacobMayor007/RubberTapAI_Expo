import { saveLeafToTreeToPlot } from "@/src/action/leafAction";
import { AppText } from "@/src/components/AppText";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import ConfirmCancelModal from "@/src/components/ConfirmOrCancelModal";
import Loading from "@/src/components/LoadingComponent";
import { useAuth } from "@/src/contexts/AuthContext";
import { useLocation } from "@/src/contexts/LocationContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { globalFunction } from "@/src/global/fetchWithTimeout";
import { Plot, Profile, SubscriptionData, Tree_Record } from "@/types";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { Link, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
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

const diseasesDescription = [
  {
    key: 0,
    label: "Oidium Heveae",
    description:
      "Oidium Heveae or Powdery mildew A condition where a rubber tree has white powdery growth on leaves, curling, distortion, and it is a serious threat to rubber-producing countries",
    effect:
      "A disease weakens the tree and shrub because it disrupts the absorption of sunlight's energy, which is essential for the metabolic energy system of the rubber tree",
    causeBy:
      "Both unpredicted weather, and nature's cycle causes the oidium heveae",
    todo: "Getting rid of the leaves can help reduce spreading of the disease.",
  },
  {
    key: 1,
    label: "Anthracnose",
    description:
      "A fungal infection causes dark spots on rubber tree leaves, leading to early leaf fall and reduced productivity",
    effect:
      "It is one of the major factor that affects the development of the rubber industry",
    causeBy: "Anthracnose is caused by a common fungal disease.",
    todo: "Spray with Daconil, or Vitigran blue at least 4 rounds weekly",
  },
  {
    key: 2,
    label: "Leaf Spot",
    description:
      "A disease-causing round or irregular spots on rubber tree leaves, often brown or dark, can reduce latex yield.",
    effect:
      "A disease weakens the tree and shrub because it disrupts the absorption of sunlight's energy, which is essential for the metabolic energy system of the rubber tree",
    causeBy: "Leaf spot is formed caused by Anthracnose.",
    todo: "Spray with Daconil, or Vitigran blue at least 4 rounds weekly",
  },
];

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
  const [treeModal, setTreeModal] = useState(false);
  const [myPlot, setMyPlot] = useState<Plot[]>([]);
  const [myTrees, setMyTrees] = useState<Tree_Record[]>([]);
  const [treeId, setTreeId] = useState("");
  const [addTreeModal, setAddTreeModal] = useState(false);
  const [chosenPlot, setChosenPlot] = useState("");
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>();
  const [takes, setTakes] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>();
  const { address } = useLocation();
  const [disable, setDisable] = useState(false);

  if (!address) {
    return Alert.alert(
      "Location required",
      "Please turn on location, thank you so much",
      [
        {
          style: "default",
          text: "Confirm",
          onPress: () => router.back(),
        },
      ]
    );
  }

  useEffect(() => {
    MyPlot();
    myTree();
  }, []);

  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions();

  useEffect(() => {
    if (!mediaPermission?.granted) {
      requestMediaPermission();
    }
    if (!permission?.granted) {
      permissionCamera();
    }
  }, []);

  const permissionCamera = async () => {
    if (!permission?.granted) {
      await requestPermission();
      if (!permission?.granted) return;
    }
  };

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

      if (data.length === 0) {
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

  const myTree = async () => {
    try {
      setPageLoading(true);
      const response = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/trees/${user?.$id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
        20000
      );

      const data = await response.json();

      if (data.length === 0) {
        Alert.alert(
          "No Registered Tree",
          "Please register tree first to use camera leaf detection!",
          [
            {
              text: "OK",
              onPress: () => router.navigate("/(tabs)/history"),
              style: "default",
            },
          ]
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setPageLoading(false);
    }
  };

  const toSaveLeafToTree = async (plot_id: string) => {
    try {
      console.log("Plot Id on Function", plot_id);

      setPageLoading(true);

      const response = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/trees/${plot_id}/${user?.$id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
        20000
      );

      const data = await response.json();

      if (data.length === 0) {
        Alert.alert(
          "No Registered Tree",
          "Please register tree first to use camera leaf detection!"
        );
        return;
      }

      setMyTrees(data);

      setChosenPlot(plot_id);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setPageLoading(false);
    }
  };

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

    if (disable) {
      return;
    }

    try {
      setDisable(true);
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
      const response3 = await fetch(`http://192.168.1.21:8080/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
        body: formData,
      });

      const dataOne = await response3.json();
      const isRubberLeaf = await isRubberTreeLeaf(dataOne.predictions);

      console.log(isRubberLeaf);

      if (isRubberLeaf === "Other" || isRubberLeaf === "Error") {
        Alert.alert(
          "Leaf Detection Error",
          "We can only detect a rubber tree leaf."
        );
        return;
      }

      const response2 = await fetch(
        `https://backend-e0gn.onrender.com/predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const data_response2 = await response2.json();

      console.log(data_response2);

      const isRubber = await isRubberTreeLeaf(data_response2.predictions);

      if (isRubber === "Other" || isRubber === "Error") {
        Alert.alert(
          "Leaf Detection Error",
          "We can only detect a rubber tree leaf."
        );
        return;
      }
      //
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
      saveToDatabase(data.predictions);
    } catch (error) {
      console.error("Upload error:", error);
      setResults({
        error: error instanceof Error ? error.message : "Prediction failed",
        predictions: [],
      });
    } finally {
      setLoading(false);
      setDisable(false);
    }
  };

  const isRubberTreeLeaf = async (results: Prediction[]) => {
    try {
      const bestResult = results.reduce(
        (max, item) => (item.probability > max.probability ? item : max),
        { className: "", probability: 0 }
      );

      return bestResult.className;
    } catch (error) {
      console.error("Save error:", error);
      return "Error";
    }
  };

  const saveToDatabase = async (results: Prediction[]) => {
    try {
      const bestResult = results.reduce(
        (max, item) => (item.probability > max.probability ? item : max),
        { className: "", probability: 0 }
      );

      let probability = bestResult.probability * 100;

      if (probability > 100) probability = 100;

      probability = parseFloat(probability.toFixed(3));

      const payload = {
        userId: profile?.$id,
        fullName: profile?.fullName,
        className: bestResult.className,
        probability,
        city: address?.city || "",
        region: address?.region || "",
        subregion: address?.subregion || "",
        country: address?.country || "",
        address: address?.formattedAddress || "",
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/save-prediction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      await response.json();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const saveLeaf = async () => {
    try {
      setPageLoading(true);
      const status = results?.predictions.reduce(
        (max: Prediction, item: Prediction) =>
          item.probability > max.probability ? item : max,
        { probability: 0, className: "" }
      ).className;

      const bestResult = results?.predictions.reduce(
        (max, item) => (item.probability > max.probability ? item : max),
        { className: "", probability: 0 }
      );

      let probability = (bestResult?.probability ?? 0) * 100;

      if (probability > 100) probability = 100;

      probability = parseFloat(probability.toFixed(3));

      const data = await saveLeafToTreeToPlot(
        user?.$id || "",
        chosenPlot || "",
        treeId,
        uri || "",
        status || "",
        profile?.API_KEY || "",
        probability
      );

      if (data) {
        console.log(status);

        console.log("Successful");
        console.log(data);

        Alert.alert(data.title, data.message);
        setPageLoading(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      router.reload();
      setPageLoading(false);
    }
  };

  const addTree = async () => {
    try {
      setLoading(true);

      const data = {
        userId: user?.$id,
        plot_id: chosenPlot,
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
      toSaveLeafToTree(chosenPlot);
    }
  };

  useEffect(() => {
    const userPayment = async () => {
      try {
        const response = await globalFunction.fetchWithTimeout(
          `${process.env.EXPO_PUBLIC_BASE_URL}/payment/${user?.$id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
          20000
        );

        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error(error);
        return null;
      }
    };

    userPayment();
  }, [user?.$id]);

  if (pageLoading) {
    return (
      <SafeAreaView className="flex-1">
        <BackgroundGradient className="flex-1 items-center justify-center">
          <Loading className="h-16 w-16 my-auto" />
        </BackgroundGradient>
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
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 40,
            position: "relative",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
            }}
            className="w-full"
          >
            <Feather
              name="x"
              size={30}
              color={"white"}
              onPress={() => router.push("/(tabs)")}
            />
            <TouchableOpacity
              onPress={() => setDropdown((prev) => !prev)}
              className={`gap-5 flex-row bg-black/50 items-center px-7 py-2 rounded-full`}
            >
              <AppText>Camera Detection</AppText>
              {dropdown ? (
                <Ionicons name="caret-up" color="white" size={28} />
              ) : (
                <Ionicons name="caret-down" color="white" size={28} />
              )}
            </TouchableOpacity>
            <Ionicons
              name={flash === "off" ? "flash-off" : "flash"}
              size={30}
              color={"white"}
              onPress={() =>
                setFlash((prev) => (prev === "off" ? "on" : "off"))
              }
            />
          </View>
          {dropdown ? (
            <Link
              href="/(camera)/measure"
              className="px-12 py-3 rounded-full  bg-black/50 z-20"
            >
              <AppText>Measure Tree Trunk</AppText>
            </Link>
          ) : null}
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
          {profile?.subscription ? (
            <View className="absolute left-[64%] bg-gray-600 py-3 rounded-lg flex-row items-center gap-1 px-3 ">
              <FontAwesome5 name="crown" size={28} color={"yellow"} />
              <AppText className="font-bold ml-2 text-lg">Unlimited</AppText>
            </View>
          ) : (
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
          )}
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
              color={theme === "dark" ? "#E2C282" : "black"}
              onPress={() => {
                setResultModal(false);
                setResults(null);
                setUri(null);
              }}
            />
            <View className="flex-1 justify-center items-center flex-col ">
              <Loading className="h-20 w-20" />
              <AppText>Analyzing Images</AppText>
            </View>
          </View>
        ) : (
          <View
            className={`flex-1 justify-between border ${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} `}
          >
            <View>
              <Feather
                name="x"
                size={30}
                color={theme === "dark" ? `#E2C282` : `black`}
                onPress={() => {
                  setResultModal(false);
                  setResults(null);
                  setUri(null);
                }}
                style={{
                  marginTop: 24,
                  marginStart: 24,
                }}
              />
              <Image
                style={{
                  width: 300,
                  height: 300,
                  borderRadius: 30,
                }}
                className="mx-auto"
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
                        {/* <Text
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
                        )} */}
                        {/* {results.predictions &&
                          results.predictions.length > 0 && ( */}
                        <Text
                          style={{
                            fontFamily: "Poppins",
                            fontWeight: 900,
                            fontSize: 18,
                            color: theme === "dark" ? "white" : "black",
                          }}
                        >
                          Detected:
                          {
                            results.predictions.reduce(
                              (max: Prediction, item: Prediction) =>
                                item.probability > max.probability ? item : max,
                              { probability: 0, className: "" }
                            ).className
                          }
                        </Text>
                        {/* )} */}
                        <Text
                          style={{
                            fontFamily: "Poppins",
                            fontWeight: 900,
                            fontSize: 18,
                            color: theme === "dark" ? "white" : "black",
                          }}
                        >
                          Probability:{" "}
                          {(
                            results.predictions.reduce(
                              (max: Prediction, item: Prediction) =>
                                item.probability > max.probability ? item : max,
                              { probability: 0, className: "" }
                            ).probability * 100
                          ).toFixed(2)}
                          %
                        </Text>
                      </>
                    )}
                  </View>
                )}
              </View>
              <View className="mx-8 ">
                {diseasesDescription.map((data) => {
                  return (
                    <View key={data.key} className="">
                      {data.label ===
                        results?.predictions.reduce(
                          (max: Prediction, item: Prediction) =>
                            item.probability > max.probability ? item : max,
                          { probability: 0, className: "" }
                        ).className && (
                        <View className="gap-4">
                          <View
                            className={`bg-[#F3E0C1] p-4 rounded-xl ${page === 1 ? `flex` : `hidden`} h-48`}
                            style={{
                              boxShadow:
                                "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
                            }}
                          >
                            <AppText color="dark" className="font-bold text-xl">
                              {data.label}:
                            </AppText>
                            <AppText color="dark" className="text-lg">
                              {"  "}
                              {data.description}
                            </AppText>
                          </View>
                          <View
                            className={`bg-[#F3E0C1] p-4 rounded-xl ${page === 1 ? `flex` : `hidden`} h-48`}
                            style={{
                              boxShadow:
                                "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
                            }}
                          >
                            <AppText color="dark" className="font-bold text-xl">
                              Negative Effect:
                            </AppText>
                            <AppText color="dark" className="text-lg">
                              {"  "}
                              {data.effect}
                            </AppText>
                          </View>
                          <View
                            className={`bg-[#F3E0C1] p-4 rounded-xl ${page === 2 ? `flex` : `hidden`} h-40`}
                            style={{
                              boxShadow:
                                "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
                            }}
                          >
                            <AppText color="dark" className="font-bold text-xl">
                              Causes:
                            </AppText>
                            <AppText color="dark" className="text-lg">
                              {"  "}
                              {data.causeBy}
                            </AppText>
                          </View>
                          <View
                            className={`bg-[#F3E0C1] p-4 rounded-xl ${page === 2 ? `flex` : `hidden`} h-40`}
                            style={{
                              boxShadow:
                                "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
                            }}
                          >
                            <AppText color="dark" className="font-bold text-xl">
                              Treatments:
                            </AppText>
                            <AppText color="dark" className="text-lg">
                              {"  "}
                              {data.todo}
                            </AppText>
                          </View>
                          <View className="mx-auto flex-row gap-8 items-center">
                            {page === 1 ? (
                              <Ionicons
                                onPress={() => setPage(1)}
                                name="radio-button-on"
                                size={22}
                                color={theme === "dark" ? `#E2C282` : `black`}
                              />
                            ) : (
                              <Ionicons
                                onPress={() => setPage(1)}
                                name="radio-button-off"
                                size={22}
                                color={theme === "dark" ? `#E2C282` : `black`}
                              />
                            )}
                            {page === 2 ? (
                              <Ionicons
                                onPress={() => setPage(2)}
                                name="radio-button-on"
                                size={22}
                                color={theme === "dark" ? `#E2C282` : `black`}
                              />
                            ) : (
                              <Ionicons
                                onPress={() => setPage(2)}
                                name="radio-button-off"
                                size={22}
                                color={theme === "dark" ? `#E2C282` : `black`}
                              />
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
            <View
              className={`pb-5 ${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} items-end `}
            >
              <TouchableOpacity
                onPress={() => {
                  setSaveModal(true);
                  setResultModal(false);
                }}
                className={`${theme === "dark" ? `bg-green-500` : `bg-[#000000]/75`} rounded-full h-12 px-7 tracking-widest  items-center justify-center mr-4`}
              >
                <Text
                  style={{
                    fontWeight: 700,
                    color: "white",
                  }}
                  className="font-poppins"
                >
                  Save To Record
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
                  Select Plots
                </Text>
                {myPlot.map((data, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={async () => {
                      setSaveModal(false);
                      toSaveLeafToTree(data?.$id);
                      setTreeModal(true);
                    }}
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

      <Modal
        visible={treeModal}
        onRequestClose={() => setTreeModal(false)}
        animationType="fade"
        className={`flex-1`}
      >
        <View
          className={`${theme === "dark" ? `bg-gray-900` : `bg-[#FFECCC]`} flex-1 p-6 `}
        >
          <View className="flex-row items-center justify-between ">
            <View className="flex-row items-center gap-5">
              <FontAwesome5
                name="arrow-left"
                size={20}
                onPress={() => {
                  setTreeModal(false);
                  setSaveModal(true);
                }}
              />
              <Text
                className={`font-poppins text-lg font-bold ${theme === "dark" ? `text-white` : `text-black`}`}
              >
                Choose tree to{"\n"}save the leaf
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (myTrees.length > 4 && !profile?.subscription) {
                  Alert.alert(
                    "We're sorry, but you used up all your Free Tier Plot Register. Subscribe to have unlimited Register Tree Plots"
                  );
                  return;
                }
                setAddTreeModal(true);
              }}
              className={`${theme === "dark" ? `bg-slate-500` : `bg-green-500`}  h-11 px-7 gap-4 rounded-full items-center flex-row justify-center`}
            >
              <Text className="text-white font-bold text-center">
                Register{`\n`}Tree
              </Text>
              <Feather name="plus-circle" size={24} color={"white"} />
            </TouchableOpacity>
          </View>
          {myTrees.length < 1 && (
            <AppText
              className="m-auto font-bold text-lg pb-2"
              color={theme === "dark" ? `light` : `dark`}
            >
              You have no Tree Registered yet
            </AppText>
          )}
          <View className={`${myTrees.length > 0 && `flex`}`}>
            <Text
              style={{ fontWeight: 700 }}
              className={`${theme === "dark" ? `text-white` : `text-black`} my-6 text-lg tracking-wide`}
            >
              Select A Tree
            </Text>
          </View>
          {myTrees.length > 0 && (
            <ScrollView
              contentContainerStyle={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 21,
              }}
              className="mt-6 flex-1 "
            >
              {myTrees.map((data, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setRegisterModal(true);
                    setTreeId(data?.$id);
                  }}
                  style={{
                    boxShadow:
                      "1px 1px 1px 1px rgba(0, 0, 0, 0.2), 0 6px 15px 0 rgba(0, 0, 0, 0.19)",
                  }}
                  className="w-[47%] h-52 rounded-lg"
                >
                  {data?.image_url ? (
                    <Image
                      source={{ uri: data?.image_url }}
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
                        No Leaf Registered on this tree yet
                      </AppText>
                    </View>
                  )}
                  <AppText
                    className="m-4 text-lg pb-0.5 font-bold font-poppins"
                    color={theme === "dark" ? `light` : `dark`}
                  >
                    Tree #{index + 1}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
      <Modal visible={registerModal} animationType="slide" transparent>
        <ConfirmCancelModal
          heightSize={60}
          blurIntensity={70}
          padding={12}
          borderRounded={10}
          onCancel={() => setRegisterModal(false)}
          onClose={() => setRegisterModal(false)}
          onOk={() => {
            setRegisterModal(false);
            saveLeaf();
          }}
        >
          <AppText
            color="dark"
            className="m-auto p-4 font-bold text-xl text-center"
          >
            Do you want to confirm to save this leaf on this tree?
          </AppText>
        </ConfirmCancelModal>
      </Modal>
      <Modal
        visible={addTreeModal}
        onRequestClose={() => setAddTreeModal(false)}
        transparent
      >
        <ConfirmCancelModal
          heightSize={60}
          blurIntensity={70}
          borderRounded={10}
          padding={12}
          onCancel={() => setAddTreeModal(false)}
          onClose={() => setAddTreeModal(false)}
          onOk={() => {
            setAddTreeModal(false);
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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#1e90ff",
    paddingHorizontal: 20,

    paddingVertical: 10,
    borderRadius: 8,
  },
});
