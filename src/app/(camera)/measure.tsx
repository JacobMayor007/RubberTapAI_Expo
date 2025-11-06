import { AppText } from "@/src/components/AppText";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import dayjs from "dayjs";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const [showInstructions, setShowInstructions] = useState("first");
  const [instructionPage, setInstructionPage] = useState("one");
  const [permission, requestPermission] = useCameraPermissions();
  const [half, setHalf] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null); // 🔹 NEW
  const [isCapturing, setIsCapturing] = useState(false);
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const windowWidth = Dimensions.get("window").width;
  const [takes, setTakes] = useState(0);
  const { profile } = useAuth();
  const { theme } = useTheme();
  const [modal, setModal] = useState(false);

  const animatedHeight = useRef(new Animated.Value(0)).current;

  // Create animated values for each measurement text
  const text1Opacity = useRef(new Animated.Value(0)).current;
  const text2Opacity = useRef(new Animated.Value(0)).current;
  const text3Opacity = useRef(new Animated.Value(0)).current;
  const text4Opacity = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;

  // ✅ Animate the red bar and text when toggling half
  useEffect(() => {
    if (half) {
      Animated.timing(animatedHeight, {
        toValue: 0.93, // 93% of container
        duration: 1000,
        useNativeDriver: false,
      }).start();

      // Fade out text labels and circle smoothly
      Animated.parallel([
        Animated.timing(text1Opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(text2Opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(text3Opacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(text4Opacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(circleOpacity, {
          toValue: 1, // Fade OUT the circle when half is true
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: false,
      }).start();

      // Fade in text labels and circle smoothly
      Animated.parallel([
        Animated.timing(text1Opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(text2Opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(text3Opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(text4Opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(circleOpacity, {
          toValue: 0, // Fade IN the circle when half is false
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [half]);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={{ color: "#fff" }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
      });

      console.log("📸 Captured photo:", photo.uri);

      // For now, just save the captured image URI and show the modal preview
      setCapturedPhoto(photo.uri);
      setModal(true);
    } catch (error) {
      console.error("Error capturing photo:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  if (showInstructions === "first") {
    return (
      <SafeAreaView className="flex-1">
        {instructionPage === "one" && (
          <Pressable
            onPress={() => setInstructionPage("two")}
            className="bg-[#F3E0C1] flex-1 p-6 gap-4"
          >
            <Feather
              onPress={() => setShowInstructions("")}
              name="x"
              size={32}
            />

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-red-500`
              } font-bold text-xl`}
            >
              📸 Pleas read the instructions first:
            </AppText>

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold text-lg`}
            >
              1️⃣ Position your camera so the rubber tree trunk is centered in
              the frame.
            </AppText>

            <Image
              style={{
                alignSelf: "center",
              }}
              source={require("@/assets/images/Instruction_One.png")}
              className="h-[50%] w-56"
            />

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold text-lg`}
            >
              2️⃣ Make sure the tree fits inside the left and right overlays.
            </AppText>

            <Text
              style={{
                alignSelf: "flex-end",
              }}
              onPress={() => setInstructionPage("two")}
              className="bg-green-500 px-5 py-2 text-white font-bold rounded-md"
            >
              Next
            </Text>
          </Pressable>
        )}
        {instructionPage === "two" && (
          <Pressable
            onPress={() => {
              setInstructionPage("");
              setShowInstructions("");
            }}
            className="bg-[#F3E0C1] flex-1 p-6 gap-4 py-20"
          >
            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold `}
            >
              3️⃣ Press and hold the round button below to start measuring.
            </AppText>

            <Image
              style={{
                alignSelf: "center",
              }}
              source={require("@/assets/images/Instruction_Two.png")}
              className="h-64 w-28"
            />

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold text-center mt-4`}
            >
              ✋ Tip: Hold your phone vertically and ensure the full trunk is
              visible for the most accurate measurement.
            </AppText>

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold text-center mt-4`}
            >
              ✋ Tip: You can hold your phone to your other hand, and pin point
              the rubber tree trunk where it says the 1m in the camera
            </AppText>
            <Image
              style={{
                alignSelf: "center",
              }}
              source={require("@/assets/images/AI_Image_2.png")}
              className="h-80 w-96"
            />
            <View className="flex-row justify-between items-center px-8 mt-4">
              <AppText
                onPress={() => setInstructionPage("one")}
                className="bg-gray-500 px-4 py-2 font-bold rounded-md text-white"
              >
                Previous
              </AppText>
              <AppText
                onPress={() => {
                  setInstructionPage("");
                  setShowInstructions("");
                }}
                className={`bg-green-500 px-5 py-2 font-bold rounded-md text-white`}
              >
                Next
              </AppText>
            </View>
          </Pressable>
        )}
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {capturedPhoto ? (
        <SafeAreaView className="flex-1 ">
          <ScrollView
            contentContainerStyle={{
              padding: 24,
              gap: 12,
              paddingBottom: 20,
              backgroundColor: theme === "dark" ? `#FFDFA9` : `#101010`,
            }}
            showsVerticalScrollIndicator={true}
          >
            <View className="flex-row items-center gap-4">
              <Feather
                name="arrow-left"
                color={theme === "dark" ? `white` : `black`}
                size={32}
                onPress={() => setCapturedPhoto("")}
              />
              <AppText className="text-[#3F1F11] font-bold font-poppins text-2xl">
                Result
              </AppText>
            </View>

            <Image
              className="mx-auto h-[220px] w-[60%] rounded-lg mt-4"
              source={{ uri: capturedPhoto }}
              resizeMode="cover"
            />

            <View
              style={{
                boxShadow:
                  "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
              }}
              className="mt-4 px-4 py-4 bg-[#F3E0C1] gap-4 rounded-xl"
            >
              <AppText
                className={`${theme === "dark" ? "text-[#E2C282]" : "text-black"} font-poppins font-bold`}
              >
                Method: Rubber Tree Measure
              </AppText>

              <AppText
                className={`${theme === "dark" ? "text-[#E2C282]" : "text-black"} font-poppins font-bold`}
              >
                Date: {dayjs().format("MM/DD/YYYY hh:mm A")}
              </AppText>

              <AppText
                className={`${theme === "dark" ? "text-[#E2C282]" : "text-black"} font-poppins font-bold text-xl`}
              >
                Tapping Guidance:
              </AppText>

              <AppText
                className={`${theme === "dark" ? "text-[#E2C282]" : "text-black"} tracking-wide leading-6 font-poppins`}
              >
                {"    "}Rubber tapping involves carefully making incisions on
                the bark of rubber trees to collect latex without harming the
                plant. The cut should be made at an angle to allow latex to flow
                smoothly into the collection cup. Ensure that the bark is not
                cut too deeply, as this can damage the tree and reduce latex
                yield. Regular and proper tapping helps maintain healthy trees
                and consistent latex production.
              </AppText>
            </View>
            <View
              style={{
                boxShadow:
                  "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
              }}
              className="mt-4 px-4 py-4 bg-[#F3E0C1] gap-4 rounded-xl"
            >
              <Image
                source={require("@/assets/images/ReferToImage.png")}
                className="w-full h-48 rounded-lg"
                resizeMode="contain"
              />
              <AppText
                className={`${theme === "dark" ? "text-[#E2C282]" : "text-black"} font-poppins font-bold`}
              >
                Refer to this image / GIF
              </AppText>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL("https://www.youtube.com/watch?v=j-gpYFBktuc")
                }
              >
                <AppText
                  className={`${theme === "dark" ? "text-[#E2C282]" : "text-blue-600"} font-poppins font-bold underline`}
                >
                  https://www.youtube.com/watch?v=j-gpYFBktuc
                </AppText>
              </TouchableOpacity>
            </View>

            {/* DONE BUTTON */}
            <TouchableOpacity
              onPress={() => {
                router.push("/(camera)");
              }}
              className="self-end bg-green-600 px-5 py-3 rounded-full mt-6"
            >
              <Text
                style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      ) : (
        <CameraView ref={cameraRef} style={styles.camera}>
          <View style={styles.leftOverlay}>
            <Link href="/(camera)" className="mt-10 mx-10">
              <Feather name="arrow-left" size={32} color={"white"} />
            </Link>
          </View>
          <View style={styles.rightOverlay}>
            {profile?.subscription ? (
              <View
                style={{
                  alignSelf: "center",
                }}
                className="absolute bottom-10 bg-gray-600 py-3 rounded-lg flex-row items-center gap-1 px-3 "
              >
                <FontAwesome5 name="crown" size={28} color={"yellow"} />
                <AppText className="font-bold ml-2 text-lg">Unlimited</AppText>
              </View>
            ) : (
              <Pressable className="absolute bottom-0 gap-1">
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
          <TouchableOpacity
            style={styles.button}
            onPressIn={() => setHalf(true)}
            onPressOut={async () => {
              setHalf(false);
              setModal(true);
              await takePhoto();
            }}
            delayLongPress={100}
            delayPressOut={100}
          >
            <View className="flex-1 rounded-full border-[1.5px] border-black" />
          </TouchableOpacity>
          <Animated.View
            style={{
              alignSelf: "center",
              backgroundColor: "red",
              width: 12,
              position: "absolute",
              bottom: 0,
              zIndex: -10,
              height: animatedHeight.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            }}
          />
          <Animated.View
            style={{
              position: "absolute",
              bottom: "92%",
              alignSelf: "center",
              backgroundColor: "white",
              height: 24,
              width: 24,
              borderRadius: "100%",
              opacity: circleOpacity,
            }}
          />

          <Animated.View
            style={{
              position: "absolute",
              bottom: "91%",
              alignSelf: "center",
              marginLeft: 60,
              opacity: text1Opacity,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 20,
              }}
            >
              1 m
            </Text>
          </Animated.View>

          <Animated.View
            style={{
              position: "absolute",
              bottom: "66%",
              alignSelf: "center",
              marginLeft: 60,
              opacity: text2Opacity,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 20,
              }}
            >
              0.75 m
            </Text>
          </Animated.View>

          <Animated.View
            style={{
              position: "absolute",
              bottom: "33%",
              alignSelf: "center",
              marginLeft: 60,
              opacity: text3Opacity,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 20,
              }}
            >
              0.25 m
            </Text>
          </Animated.View>

          <Animated.View
            style={{
              position: "absolute",
              bottom: "0%",
              alignSelf: "center",
              marginLeft: 60,
              opacity: text4Opacity,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 20,
              }}
            >
              0 m
            </Text>
          </Animated.View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#000",
  },
  camera: { flexGrow: 1 },
  leftOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "37%",
    backgroundColor: "rgba(0,0,0,0.80)",
  },
  rightOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "37%",
    backgroundColor: "rgba(0,0,0,0.80)",
  },

  button: {
    backgroundColor: "#FFFFFF",
    padding: 4,
    height: 72,
    width: 72,
    borderRadius: "50%",
    zIndex: 30,
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
});
