import { Profile } from "@/types";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { ID } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "../contexts/LocationContext";
import { storage } from "../lib/appwrite";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { ViewPressable } from "./ViewPressable";

export default function AddProduct() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const { user } = useAuth();
  const [flip, setFlip] = useState<"front" | "back">("back");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cameraModal, setCameraModal] = useState(false);
  const [categoryVisible, setCategoryVisible] = useState(false);
  const [permission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);

  const address = useLocation();

  const categories = [
    {
      id: 0,
      name: "Latex",
    },
    {
      id: 1,
      name: "Waste Rubber",
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          router.replace("/(tabs)/market");
          return;
        }

        const coords = await Location.getCurrentPositionAsync();
        if (coords) {
          const { latitude, longitude } = coords.coords;

          const response = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          const res = response[0];
          if (res) {
            address.setAddress(res);
            await AsyncStorage.setItem("user_address", JSON.stringify(res));
          } else {
            console.warn("No reverse geocode result");
          }
        }
      } catch (error) {
        console.error("Error getting location info:", error);
      } finally {
        router.reload();
      }
    })();
  }, []);

  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions();
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

  const takePhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync();
      if (photo?.uri) {
        setUri(photo.uri);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setCameraModal(false);
    }
  };

  useEffect(() => {
    if (!mediaPermission?.granted) {
      requestMediaPermission();
    }
  }, []);

  const pickAnImage = async () => {
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
    }

    console.log(result);
  };

  const validating = () => {
    try {
      if (!uri || !category || !price || !description || !address) {
        Alert.alert("Adding error", "Please input all fields");
        setConfirmModal(false);
        return;
      }

      if (!address?.address) {
        Alert.alert("To add product, please allow to share your location");
        setConfirmModal(false);
        return;
      }

      setConfirmModal(true);
    } catch (error) {
      Alert.alert(
        "Adding new product failed. Make sure to input all necessary fields"
      );
      return;
    }
  };

  const addProduct = async () => {
    try {
      let fileUrl = "";

      if (uri) {
        const fileInfo = await FileSystem.getInfoAsync(uri);

        if (!fileInfo.exists) {
          Alert.alert("File does not exist!");
        } else {
          const result = await storage.createFile(
            `${process.env.EXPO_PUBLIC_APPWRITE_STORAGE}`,
            ID.unique(),
            {
              uri: uri,
              name: `image_${Date.now()}.jpg`,
              type: "image/jpeg",
              size: fileInfo.size,
            }
          );

          console.log("Image uploaded!", result);

          fileUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.EXPO_PUBLIC_APPWRITE_STORAGE}/files/${result.$id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`;

          const data = {
            address: address?.address?.formattedAddress || "",
            user_id: profile?.$id || "",
            user_username: profile?.username || "",
            user_email: profile?.email || "",
            farmerProfile: profile?.imageURL || "",
            productURL: fileUrl,
            category: category?.toLowerCase() || "",
            description: description || "",
            price: Number(price),
            city: address?.address?.city || "",
            region: address?.address?.region || "",
            country: address?.address?.country || "",
          };

          const response = await fetch(
            `${process.env.EXPO_PUBLIC_BASE_URL}/product`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(data),
            }
          );

          const responseData = await response.json();

          if (response.ok) {
            Alert.alert(
              responseData.message || "Successfully added your new product!"
            );
          } else {
            Alert.alert(
              responseData.message ||
                "Adding new product failed. Make sure to input all necessary fields"
            );
          }
        }

        setUri("");
      } else {
        Alert.alert("Missing product photo");
      }

      // await addNewProduct(
      //   address?.address.formattedAddress || "",
      //   profile?.$id || "",
      //   profile?.username || "",
      //   profile?.email || "",
      //   fileUrl,
      //   profile?.imageURL || "",
      //   category.toLowerCase(),
      //   description,
      //   Number(price),
      //   address?.address.city || "",
      //   address?.address.region || "",
      //   address?.address.country || ""
      // );

      setCategory("");
      setPrice("");
      setDescription("");
    } catch (error) {
      console.error(error);
    }

    // finally {
    //   setConfirmModal(false);
    //   router.replace("/(tabs)/market");
    // }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFECCC] border">
      <KeyboardAvoidingView
        behavior="height"
        keyboardVerticalOffset={0}
        style={{
          paddingTop: 32,
          paddingHorizontal: 32,
          paddingBottom: 8,
          flexGrow: 1,
        }}
      >
        <ScrollView className="flex-1 pb-7">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-4">
              <FontAwesome5
                name="arrow-left"
                size={20}
                onPress={() => router.replace("/(tabs)/market")}
              />
              <AppText
                color={"dark"}
                className="font-poppins font-extrabold text-2xl"
              >
                Marketplace
              </AppText>
            </View>
          </View>
          <AppText
            color={"dark"}
            className="font-poppins font-bold text-xl mt-2"
          >
            Rubber/Latex*
          </AppText>
          <AppText
            color={"dark"}
            className="font-poppins font-light text-sm mt-1"
          >
            You can sell your harvest latex and waste rubber here.
          </AppText>

          {uri ? (
            <View
              style={{ height: 150 }}
              className="border mt-2 rounded-xl items-center justify-center"
            >
              <Image className="h-36 w-36" source={{ uri: uri }} />
            </View>
          ) : (
            <View
              style={{ height: 150 }}
              className="border mt-2 rounded-xl items-center justify-center"
            >
              <View className="flex-row gap-4">
                <ViewPressable
                  onPress={() => {
                    setCameraModal(true);
                    requestCameraPermission();
                  }}
                  className=" h-20 w-20 flex-row rounded-lg items-center justify-center bg-slate-500"
                >
                  <SimpleLineIcons name="camera" size={40} />
                </ViewPressable>
                <ViewPressable
                  onPress={pickAnImage}
                  className=" h-20 w-20 flex-row rounded-lg items-center justify-center bg-slate-500"
                >
                  <Entypo name="folder-images" size={40} />
                </ViewPressable>
              </View>
              <AppText color={"dark"} className="font-poppins text-sm mt-4">
                Upload the photo of your item/rubber waste/latex
              </AppText>
            </View>
          )}

          <AppText
            color={"dark"}
            className=" mt-2 font-poppins font-bold text-lg"
          >
            Category*
          </AppText>
          <View className="h-12 border relative rounded-lg items-center px-4 flex-row justify-between">
            <AppText
              color={"dark"}
              className={`font-poppins font-light w-11/12 ${!category ? `text-[#727272]` : `text-black`}`}
            >
              {!category ? `Choose type of category` : category}
            </AppText>
            <MaterialIcons
              onPress={() => setCategoryVisible((prev) => !prev)}
              size={42}
              name={categoryVisible ? `arrow-drop-up` : `arrow-drop-down`}
            />
            {categoryVisible && (
              <View className="absolute  bg-white w-full -left-2 z-20 top-11 gap-2 justify-center">
                {categories.map((data, index) => {
                  return (
                    <AppText
                      color="dark"
                      key={index}
                      onPress={() => {
                        setCategoryVisible(false);
                        setCategory(data?.name);
                      }}
                      className=" h-12 py-2 px-4 rounded-md border-b-[1px]"
                    >
                      {data?.name}
                    </AppText>
                  );
                })}
              </View>
            )}
          </View>
          <AppText
            color={"dark"}
            className=" mt-2 font-poppins font-bold text-lg"
          >
            Price*
          </AppText>
          <View className="h-12 border rounded-lg items-center px-4 flex-row justify-between">
            <TextInput
              placeholder="Enter Price per kilo"
              className="placeholder:text-[#727272] font-light  w-11/12"
              value={price}
              onChangeText={(text) => {
                const sanitizedText = text.replace(/[^0-9.]/g, "");
                setPrice(sanitizedText);
              }}
              keyboardType="numeric"
            />
            <FontAwesome6 name="peso-sign" size={16} color={"green"} />
          </View>
          <AppText
            color={"dark"}
            className="mt-2 font-poppins font-bold text-lg "
          >
            Description*
          </AppText>
          <View className="border-[1px] h-32 rounded-lg p-2">
            <TextInput
              placeholder="Enter description of the product"
              value={description}
              placeholderTextColor={"#797979"}
              onChangeText={(e) => setDescription(e)}
              multiline
              className=" drop-shadow-2xl text-slate-900 font-light"
            />
          </View>
          <AppText
            color={"dark"}
            className="mt-3 font-poppins font-bold text-lg"
          >
            Sellers Details
          </AppText>
          <View className="h-24 border flex-row rounded-lg mb-7 items-center px-7 gap-4">
            <Image
              className="h-12 w-12 rounded-full"
              source={{ uri: profile?.imageURL }}
            />
            <View className="flex-col gap-1 text-wrap">
              <AppText color={"dark"} className="font-poppins font-bold">
                {profile?.username}
              </AppText>
              <AppText
                color={"dark"}
                className="w-7/12 font-poppins font-extralight text-sm"
              >
                {address?.address?.formattedAddress}
              </AppText>
            </View>
          </View>
          <Button
            title="Post Item"
            onPress={validating}
            className="my-2 py-1 rounded-full font-poppins font-bold text-xl"
          />
        </ScrollView>
        <Modal visible={cameraModal} animationType="slide">
          {permission && (
            <CameraView
              facing={flip}
              ref={cameraRef}
              style={{
                flexGrow: 1,
                padding: 24,
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <FontAwesome5
                name="arrow-left"
                size={20}
                color={"black"}
                onPress={() => setCameraModal(false)}
              />

              <View className="items-center  flex-row justify-center">
                <Pressable
                  style={{
                    height: 60,
                    width: 60,
                    backgroundColor: "white",
                    borderRadius: 30,
                    borderWidth: 0,
                    borderColor: "red",
                    borderStyle: "solid",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={takePhoto}
                >
                  <MaterialIcons name="camera" size={40} />
                </Pressable>
                <ViewPressable
                  onPress={() =>
                    setFlip((prev) => (prev === "back" ? "front" : "back"))
                  }
                  className="absolute left-[70%] bg-white p-2 rounded-full"
                >
                  <MaterialIcons name="cameraswitch" size={32} />
                </ViewPressable>
              </View>
            </CameraView>
          )}
        </Modal>
        <Modal visible={confirmModal} animationType="slide" transparent>
          <BlurView
            intensity={90}
            className="flex-1 items-center justify-center"
            tint="dark"
          >
            <View className="gap-4 h-44 w-10/12 bg-white rounded-xl flex-col items-center py-4">
              <View className="rounded-full bg-slate-200 h-10 w-10 items-center justify-center">
                <Image
                  source={require("@/assets/images/iconify-report-icon.png")}
                  className="h-6 w-6"
                />
              </View>
              <AppText color={"dark"} className="font-poppins">
                Do you wish to confirm?
              </AppText>
              <View className="flex-row items-center gap-10">
                <AppText
                  color={"dark"}
                  onPress={() => setConfirmModal(false)}
                  className="py-2 px-6 bg-slate-200 rounded-lg font-poppins font-semibold"
                >
                  Cancel
                </AppText>
                <AppText
                  color={"light"}
                  className="py-2 px-6 bg-[#75A90A] rounded-lg font-poppins font-semibold"
                  onPress={() => {
                    addProduct();
                    setConfirmModal(false);
                  }}
                >
                  Confirm
                </AppText>
              </View>
            </View>
          </BlurView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
