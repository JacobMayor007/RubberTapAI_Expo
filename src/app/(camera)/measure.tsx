import { AppText } from "@/src/components/AppText";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
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
  const cameraRef = useRef<CameraView>(null);
  const windowWidth = Dimensions.get("window").width;
  const [takes, setTakes] = useState(0);
  const { profile } = useAuth();
  const { theme } = useTheme();

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
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } mb-6 font-bold text-center text-xl`}
            >
              🌱 Welcome to the Rubber Tree Measure!
            </AppText>

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold px-16 text-justify`}
            >
              {"      "}Measure the height of{" "}
              <Text className="italic">Hevea brasiliensis</Text>. This tool
              helps users to estimate the trunk’s length for tapping and
              productivity assessment.
            </AppText>

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold `}
            >
              📸 Instructions:
            </AppText>

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold text-lg`}
            >
              1️⃣ Position your camera so the rubber tree trunk is centered in
              the frame.
            </AppText>

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold text-lg`}
            >
              2️⃣ Make sure the tree fits inside the left and right overlays.
            </AppText>

            <Image
              style={{
                alignSelf: "center",
              }}
              source={require("@/assets/images/Instruction_One.png")}
              className="h-[50%] w-56"
            />
            <AppText className="font-poppins italic text-right text-yellow-500 underline">
              Just press to next
            </AppText>
          </Pressable>
        )}
        {instructionPage === "two" && (
          <Pressable
            className="bg-[#F3E0C1] flex-1 p-6 gap-4 py-20"
            onPress={() => {
              setInstructionPage("");
              setShowInstructions("");
            }}
          >
            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold `}
            >
              3️⃣ Tap the round button below to start measuring.
            </AppText>

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold `}
            >
              4️⃣ Stay steady while the system calculates the trunk’s dimensions.
            </AppText>

            <AppText
              className={`${
                theme === "dark" ? `text-[#E8C282]` : `text-black`
              } font-bold text-justify`}
            >
              5️⃣ You can tap the measure button{" "}
              <Text style={{ color: "#E63946" }}>twice</Text> to extend the
              measurement — or simply align your phone so that the{" "}
              <Text style={{ color: "#E63946" }}>0.5 m mark</Text> matches the
              top of the trunk to estimate up to{" "}
              <Text style={{ color: "#E63946" }}>1 m</Text>.
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
          </Pressable>
        )}
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
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
          onPress={() => setHalf((prev) => !prev)}
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

        {/* Measurement labels with smooth transitions */}
        {/* Measurement labels with smooth transitions */}
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
            0.5 m
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
            0.33 m
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
            0.16 m
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
