import { AppText } from "@/src/components/AppText";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import dayjs from "dayjs";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Text,
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

  // Request camera and media permissions
  useEffect(() => {
    (async () => {
      await requestPermission();
      await MediaLibrary.requestPermissionsAsync();
    })();
  }, []);

  useEffect(() => {
    const isPermitted = async () => {
      if (!permission) {
        await requestPermission();
      }
    };
    isPermitted();
  }, [permission]);

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo?.uri) {
        setUri(photo.uri);
        await uploadImage(photo.uri);
      }
    } catch (error) {
      console.log("Error taking photo:", error);
    } finally {
      setResultModal(true);
    }
  };

  const pickAnImage = async () => {
    try {
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
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setResultModal(true);
    }
  };

  const uploadImage = async (uri: string) => {
    const formData = new FormData();
    formData.append("image", {
      uri,
      name: "photo.jpg",
      type: "image/jpeg",
    } as any);

    try {
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
    }
  };

  return (
    <SafeAreaView style={{ flexGrow: 1 }}>
      <CameraView
        style={{
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
        ref={cameraRef}
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
              <Pressable
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
                  0/25 Scan
                </Text>
              </Pressable>
            </View>
            <AppText
              color={"light"}
              className="font-poppins text-center tracking-widest font-bold"
            >
              Get Unlimited
            </AppText>
          </Pressable>
        </View>
      </CameraView>

      <Modal
        style={{
          flexGrow: 1,
          backgroundColor: "#FFECCC",
        }}
        animationType="slide"
        visible={resultModal}
        transparent={!results ? true : false}
        onRequestClose={() => setResultModal(false)}
      >
        {!results ? undefined : (
          <Feather
            name="x"
            size={30}
            color={"black"}
            style={{ backgroundColor: "#FFECCC" }}
            onPress={() => {
              setResultModal(false);
              setResults(null);
              setUri(null);
            }}
          />
        )}

        {!results ? (
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
          <View className="flex-1 bg-[#FFECCC] px-16 ">
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
                    <Text style={{ color: "red" }}>Error: {results.error}</Text>
                  ) : (
                    <>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Results:
                      </Text>
                      {results.predictions?.map(
                        (item: Prediction, index: number) => (
                          <Text key={index}>
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
              color={"dark"}
              className="font-extrabold text-lg font-poppins mt-10"
            >
              Method: Leaf Disease Detection
            </AppText>
            <AppText color={"dark"} className="font-bold font-poppins">
              Date: {dayjs().format("MMMM DD, YYYY hh:mm A")}
            </AppText>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}
