import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import React, { useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

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

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({
      skipProcessing: true,
    });

    // Crop to keep only the middle 50% of the width
    const manipulated = await ImageManipulator.manipulateAsync(
      photo.uri,
      [
        {
          crop: {
            originX: photo.width * 0.25, // start at 25% width
            originY: 0,
            width: photo.width * 0.5, // keep middle 50%
            height: photo.height, // full height
          },
        },
      ],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    setPhotoUri(manipulated.uri);
  };

  return (
    <View style={styles.container}>
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{ flex: 1 }}
          resizeMode="contain"
        />
      ) : (
        <CameraView ref={cameraRef} style={styles.camera}>
          {/* Left Overlay */}
          <View style={styles.leftOverlay} />
          {/* Right Overlay */}
          <View style={styles.rightOverlay} />

          {/* Capture button */}
          <View style={styles.bottomBar}>
            <TouchableOpacity onPress={takePicture} style={styles.button}>
              <Text style={{ color: "#fff" }}>Capture Middle</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
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
    width: "25%",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  rightOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "25%",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  bottomBar: { position: "absolute", bottom: 30, alignSelf: "center" },
  button: {
    backgroundColor: "#1e90ff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
