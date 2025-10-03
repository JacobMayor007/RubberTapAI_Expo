import Feather from "@expo/vector-icons/Feather";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [half, setHalf] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const windowWidth = Dimensions.get("window").width;

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

  if (!permission) return <View />;
  if (!permission.granted) {
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

  console.log(windowWidth);

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera}>
        {/* Left Overlay */}
        <View style={styles.leftOverlay}>
          <Link href="/(camera)" className="mt-10 mx-10">
            <Feather name="arrow-left" size={32} />
          </Link>
        </View>
        {/* Right Overlay */}
        <View style={styles.rightOverlay}>
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setHalf((prev) => !prev)}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>
                {half ? "Reset" : "Capture to measure the Half"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View
          style={{
            alignSelf: "center",
            backgroundColor: "red",
            width: 12,
            position: "absolute",
            bottom: 0,
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
            1.5 m
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
            1.0 m
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
            0.5 m
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
            0m
          </Text>
        </Animated.View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  leftOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "37%",
    backgroundColor: "rgb(255,255,255)",
  },
  rightOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "37%",
    backgroundColor: "rgb(255,255,255)",
  },
  bottomBar: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
  button: {
    backgroundColor: "#1e90ff",
    paddingHorizontal: 20,

    paddingVertical: 10,
    borderRadius: 8,
  },
});
