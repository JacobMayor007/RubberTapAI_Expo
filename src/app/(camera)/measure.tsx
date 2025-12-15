import { AppText } from "@/src/components/AppText";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import DistanceChecker from "@/src/components/DistanceChecker";
import MeasuringInstructions from "@/src/components/MeasuringInstruction";
import TreeMeasurementGuidance from "@/src/components/TreeMeasurementGuidance";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import dayjs from "dayjs";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { getColors } from "react-native-image-colors";
import { SafeAreaView } from "react-native-safe-area-context";

const REFERENCE_PHONE = {
  height: 943.5293852994193,
  width: 423.5293998850261,
};

const MEASUREMENT_POSITIONS = {
  "1m": 0.91,
  "0.75m": 0.66,
  "0.25m": 0.33,
  "0m": 0.0,
};

const FIXED_RED_LINE_HEIGHT = Math.round(
  REFERENCE_PHONE.height * MEASUREMENT_POSITIONS["1m"]
);

// Type definitions
interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface ColorRange {
  h: [number, number];
  s: [number, number];
  l: [number, number];
}

interface ImageColorsResultType {
  dominant?: string;
  average?: string;
  platform?: string;
  darkMuted?: string;
  darkVibrant?: string;
  lightMuted?: string;
  lightVibrant?: string;
  muted?: string;
  vibrant?: string;
}

// Rubber tree color ranges (golden to light to dark brown bark)
// Based on actual rubber tree trunk colors
const RUBBER_TREE_COLOR_RANGES: { [key: string]: ColorRange } = {
  goldenBrown: { h: [30, 60], s: [20, 70], l: [35, 65] }, // Golden brown tones
  lightBrown: { h: [20, 50], s: [15, 60], l: [45, 70] }, // Light brown tones
  mediumBrown: { h: [15, 45], s: [25, 75], l: [30, 55] }, // Medium brown tones
  darkBrown: { h: [10, 40], s: [30, 80], l: [20, 45] }, // Dark brown tones
  warmGray: { h: [20, 50], s: [5, 30], l: [40, 65] }, // Warm gray/tan tones
};

// Convert hex to RGB
const hexToRgb = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Convert RGB to HSL
const rgbToHsl = (r: number, g: number, b: number): HSL => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h: number = 0,
    s: number = 0,
    l: number = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

// Check if color matches rubber tree
const isRubberTreeColor = (hexColor: string): boolean => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return false;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Check if it matches any of the rubber tree color ranges
  const matchesGoldenBrown =
    hsl.h >= RUBBER_TREE_COLOR_RANGES.goldenBrown.h[0] &&
    hsl.h <= RUBBER_TREE_COLOR_RANGES.goldenBrown.h[1] &&
    hsl.s >= RUBBER_TREE_COLOR_RANGES.goldenBrown.s[0] &&
    hsl.s <= RUBBER_TREE_COLOR_RANGES.goldenBrown.s[1] &&
    hsl.l >= RUBBER_TREE_COLOR_RANGES.goldenBrown.l[0] &&
    hsl.l <= RUBBER_TREE_COLOR_RANGES.goldenBrown.l[1];

  const matchesLightBrown =
    hsl.h >= RUBBER_TREE_COLOR_RANGES.lightBrown.h[0] &&
    hsl.h <= RUBBER_TREE_COLOR_RANGES.lightBrown.h[1] &&
    hsl.s >= RUBBER_TREE_COLOR_RANGES.lightBrown.s[0] &&
    hsl.s <= RUBBER_TREE_COLOR_RANGES.lightBrown.s[1] &&
    hsl.l >= RUBBER_TREE_COLOR_RANGES.lightBrown.l[0] &&
    hsl.l <= RUBBER_TREE_COLOR_RANGES.lightBrown.l[1];

  const matchesMediumBrown =
    hsl.h >= RUBBER_TREE_COLOR_RANGES.mediumBrown.h[0] &&
    hsl.h <= RUBBER_TREE_COLOR_RANGES.mediumBrown.h[1] &&
    hsl.s >= RUBBER_TREE_COLOR_RANGES.mediumBrown.s[0] &&
    hsl.s <= RUBBER_TREE_COLOR_RANGES.mediumBrown.s[1] &&
    hsl.l >= RUBBER_TREE_COLOR_RANGES.mediumBrown.l[0] &&
    hsl.l <= RUBBER_TREE_COLOR_RANGES.mediumBrown.l[1];

  const matchesDarkBrown =
    hsl.h >= RUBBER_TREE_COLOR_RANGES.darkBrown.h[0] &&
    hsl.h <= RUBBER_TREE_COLOR_RANGES.darkBrown.h[1] &&
    hsl.s >= RUBBER_TREE_COLOR_RANGES.darkBrown.s[0] &&
    hsl.s <= RUBBER_TREE_COLOR_RANGES.darkBrown.s[1] &&
    hsl.l >= RUBBER_TREE_COLOR_RANGES.darkBrown.l[0] &&
    hsl.l <= RUBBER_TREE_COLOR_RANGES.darkBrown.l[1];

  const matchesWarmGray =
    hsl.h >= RUBBER_TREE_COLOR_RANGES.warmGray.h[0] &&
    hsl.h <= RUBBER_TREE_COLOR_RANGES.warmGray.h[1] &&
    hsl.s >= RUBBER_TREE_COLOR_RANGES.warmGray.s[0] &&
    hsl.s <= RUBBER_TREE_COLOR_RANGES.warmGray.s[1] &&
    hsl.l >= RUBBER_TREE_COLOR_RANGES.warmGray.l[0] &&
    hsl.l <= RUBBER_TREE_COLOR_RANGES.warmGray.l[1];

  return (
    matchesGoldenBrown ||
    matchesLightBrown ||
    matchesMediumBrown ||
    matchesDarkBrown ||
    matchesWarmGray
  );
};

export default function App() {
  const [showInstructions, setShowInstructions] = useState("first");
  const [distance, setDistance] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [half, setHalf] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [takes, setTakes] = useState(0);
  const { profile } = useAuth();
  const { theme } = useTheme();
  const [modal, setModal] = useState(false);
  const [colors, setColors] = useState<ImageColorsResultType | null>(null);
  const [status, setStatus] = useState(false);

  const { height: deviceHeight, width: deviceWidth } = useWindowDimensions();

  useEffect(() => {
    if (
      deviceHeight < REFERENCE_PHONE.height ||
      deviceWidth < REFERENCE_PHONE.width
    ) {
      Alert.alert(
        "Device Screen Too Small",
        "Your device screen is too small for accurate measurements. Please use a phone with a larger screen.",
        [
          {
            text: "Go Back",
            onPress: () => router.push("/(camera)"),
            style: "cancel",
          },
        ]
      );
    }
  }, [deviceHeight, deviceWidth, router]);

  const MEASUREMENT_LABELS = [
    { label: "1 m", pixelPosition: FIXED_RED_LINE_HEIGHT },
    {
      label: "0.75 m",
      pixelPosition: Math.round(
        REFERENCE_PHONE.height * MEASUREMENT_POSITIONS["0.75m"]
      ),
    },
    {
      label: "0.25 m",
      pixelPosition: Math.round(
        REFERENCE_PHONE.height * MEASUREMENT_POSITIONS["0.25m"]
      ),
    },
    { label: "0 m", pixelPosition: 0 },
  ];

  useEffect(() => {
    permissionCamera();
  }, []);

  const permissionCamera = async () => {
    if (!permission?.granted) {
      await requestPermission();
      if (!permission?.granted) return;
    }
  };

  const animatedHeight = useRef(new Animated.Value(0)).current;
  const textOpacities = useRef(
    MEASUREMENT_LABELS.map(() => new Animated.Value(0))
  ).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (half) {
      Animated.timing(animatedHeight, {
        toValue: FIXED_RED_LINE_HEIGHT,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      const animations = textOpacities.map((opacity, index) =>
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000 + index * 200,
          useNativeDriver: true,
        })
      );

      animations.push(
        Animated.timing(circleOpacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );

      Animated.parallel(animations).start();
    } else {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: false,
      }).start();

      const animations = textOpacities.map((opacity, index) =>
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300 + index * 100,
          useNativeDriver: true,
        })
      );

      animations.push(
        Animated.timing(circleOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        })
      );

      Animated.parallel(animations).start();
    }
  }, [half]);

  const takePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
      });

      console.log("📸 Captured photo:", photo.uri);

      const screenRatio = deviceWidth / photo.width;
      const cropLeftPixels = Math.round((deviceWidth * 0.415) / screenRatio);
      const visibleWidth = photo.width - cropLeftPixels * 2;

      const croppedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [
          {
            crop: {
              originX: cropLeftPixels,
              originY: 0,
              width: visibleWidth,
              height: photo.height,
            },
          },
        ],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      console.log("✂️ Cropped photo:", croppedPhoto.uri);
      const url = croppedPhoto.uri;
      const result: ImageColorsResultType = await getColors(url);
      console.log("🎨 Detected colors:", result);

      // Validate if the detected colors match rubber tree
      const dominant = result.dominant || result.vibrant || "";
      const average = result.average || result.muted || "";

      const isDominantMatch = isRubberTreeColor(dominant);
      const isAverageMatch = isRubberTreeColor(average);

      console.log(`🌳 Dominant color match: ${isDominantMatch}`);
      console.log(`🌳 Average color match: ${isAverageMatch}`);

      if (!isDominantMatch || !isAverageMatch) {
        Alert.alert(
          "⚠️ Try Again",
          "You are too far from the rubber tree or the image doesn't show the tree clearly. Please move closer and try again.",
          [
            {
              text: "OK",
              onPress: () => {
                setHalf(false);
                setModal(false);
              },
            },
          ]
        );
        setIsCapturing(false);
        return;
      }

      // Colors match - proceed with photo
      setCapturedPhoto(photo.uri);
      setColors(result);
      setModal(true);
    } catch (error) {
      console.error("Error capturing photo:", error);
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleClosePhoto = () => {
    setCapturedPhoto("");
    setHalf(false);
    animatedHeight.setValue(0);
    textOpacities.forEach((opacity) => opacity.setValue(0));
    circleOpacity.setValue(0);
  };

  if (showInstructions === "first") {
    return <MeasuringInstructions setShowInstructions={setShowInstructions} />;
  }

  return (
    <View style={styles.container}>
      {capturedPhoto ? (
        <SafeAreaView className="flex-1 ">
          <ScrollView
            contentContainerStyle={{
              gap: 12,
              paddingBottom: 20,
              backgroundColor: theme === "dark" ? `#101010` : `#FFDFA9`,
            }}
            showsVerticalScrollIndicator={true}
          >
            <BackgroundGradient className="flex-1 p-6">
              <View className="flex-row items-center gap-4">
                <Feather
                  name="arrow-left"
                  color={theme === "dark" ? `#E2C282` : `black`}
                  size={32}
                  onPress={() => handleClosePhoto()}
                />
                <AppText
                  className={`${
                    theme === "dark" ? `text-[#E8C282]` : `text-[#3F1F11]`
                  } font-bold font-poppins text-2xl`}
                >
                  Result
                </AppText>
              </View>

              <Image
                className="mx-auto h-72 w-56 rounded-lg mt-4"
                source={{ uri: capturedPhoto }}
                resizeMode="cover"
              />

              <View
                style={{
                  backgroundColor: theme === "dark" ? `#101010` : `#FFDFA9`,
                  boxShadow:
                    "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
                }}
                className="mt-4 px-4 py-4 gap-4 rounded-xl"
              >
                <AppText
                  className={`${
                    theme === "dark" ? "text-[#E2C282]" : "text-black"
                  } font-poppins font-bold`}
                >
                  Method: Rubber Tree Measure
                </AppText>

                <AppText
                  className={`${
                    theme === "dark" ? "text-[#E2C282]" : "text-black"
                  } font-poppins font-bold`}
                >
                  Date: {dayjs().format("MM/DD/YYYY hh:mm A")}
                </AppText>

                <AppText
                  className={`${
                    theme === "dark" ? "text-[#E2C282]" : "text-black"
                  } font-poppins font-bold text-xl`}
                >
                  Tapping Guidance:
                </AppText>

                <AppText
                  className={`${
                    theme === "dark" ? "text-[#E2C282]" : "text-black"
                  } tracking-wide leading-6 font-poppins`}
                >
                  {"    "}Rubber tapping involves carefully making incisions on
                  the bark of rubber trees to collect latex without harming the
                  plant. The cut should be made at an angle to allow latex to
                  flow smoothly into the collection cup. Ensure that the bark is
                  not cut too deeply, as this can damage the tree and reduce
                  latex yield. Regular and proper tapping helps maintain healthy
                  trees and consistent latex production.
                </AppText>
              </View>
              <View
                style={{
                  boxShadow:
                    "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
                  backgroundColor: theme === "dark" ? `#101010` : `#FFDFA9`,
                }}
                className="mt-4 px-4 py-4  gap-4 rounded-xl"
              >
                <Image
                  source={require("@/assets/images/ReferToImage.png")}
                  className="w-full h-48 rounded-lg"
                  resizeMode="contain"
                />
                <AppText
                  className={`${
                    theme === "dark" ? "text-[#E2C282]" : "text-black"
                  } font-poppins font-bold`}
                >
                  Refer to this image / GIF
                </AppText>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      "https://www.youtube.com/watch?v=j-gpYFBktuc"
                    )
                  }
                >
                  <AppText
                    className={`${
                      theme === "dark" ? "text-[#E2C282]" : "text-blue-600"
                    } font-poppins font-bold underline`}
                  >
                    https://www.youtube.com/watch?v=j-gpYFBktuc
                  </AppText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  handleClosePhoto();
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
            </BackgroundGradient>
          </ScrollView>
        </SafeAreaView>
      ) : (
        <View style={styles.cameraContainer}>
          {distance ? (
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
                    <AppText className="font-bold ml-2 text-lg">
                      Unlimited
                    </AppText>
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

              <TreeMeasurementGuidance
                cameraRef={cameraRef}
                isMeasuring={!half}
                setStatus={setStatus}
              />

              <TouchableOpacity
                style={styles.button}
                disabled={status}
                onPressIn={() => setHalf(true)}
                onPressOut={async () => {
                  setHalf(false);
                  setModal(true);
                  await takePhoto();
                }}
                delayLongPress={100}
                delayPressOut={100}
                className={`${status ? `bg-gray-500` : `bg-white`}`}
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
                    inputRange: [0, FIXED_RED_LINE_HEIGHT],
                    outputRange: [0, FIXED_RED_LINE_HEIGHT],
                  }),
                }}
              />

              <Animated.View
                style={{
                  position: "absolute",
                  bottom: FIXED_RED_LINE_HEIGHT,
                  alignSelf: "center",
                  backgroundColor: "white",
                  height: 24,
                  width: 24,
                  borderRadius: 12,
                  opacity: circleOpacity,
                }}
              />

              {MEASUREMENT_LABELS.map((item, index) => (
                <Animated.View
                  key={index}
                  style={{
                    position: "absolute",
                    bottom: item.pixelPosition,
                    alignSelf: "center",
                    marginLeft: 60,
                    opacity: textOpacities[index],
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 20,
                      fontWeight: "bold",
                    }}
                  >
                    {item.label}
                  </Text>
                </Animated.View>
              ))}
            </CameraView>
          ) : (
            <DistanceChecker />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#000",
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: { flex: 1 },
  leftOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "37%",
    backgroundColor: "rgba(0,0,0,0.80)",
    zIndex: 20,
  },
  rightOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "37%",
    backgroundColor: "rgba(0,0,0,0.80)",
    zIndex: 20,
  },

  button: {
    padding: 4,
    height: 72,
    width: 72,
    borderRadius: 36,
    zIndex: 30,
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
});
