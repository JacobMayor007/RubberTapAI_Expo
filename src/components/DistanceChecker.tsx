import { CameraView } from "expo-camera";
import * as FileSystem from "expo-file-system";
import { useEffect, useRef } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { compressImage } from "../services/imageCompressionUtil";

const CAMERA_CACHE_DIR = FileSystem.cacheDirectory + "distance-checker/";

export default function DistanceChecker() {
  const cameraRef = useRef<CameraView>(null);
  const capturedImages = [];

  Alert.alert(
    "🔔Reminder:",
    "The rubber tree trunk should be the center of the camera. Have fun and enjoy measuring"
  );

  useEffect(() => {
    FileSystem.makeDirectoryAsync(CAMERA_CACHE_DIR, {
      intermediates: true,
    });

    return () => {
      clearCameraCache();
    };
  }, []);

  const clearCameraCache = async () => {
    try {
      await FileSystem.deleteAsync(CAMERA_CACHE_DIR, {
        idempotent: true,
      });
      console.log("DistanceChecker cache cleared");
    } catch (e) {
      console.warn("Cache cleanup failed", e);
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
      });

      if (photo.uri) {
        const rawPath = CAMERA_CACHE_DIR + `raw-${Date.now()}.jpg`;

        await FileSystem.moveAsync({
          from: photo.uri,
          to: rawPath,
        });

        const fileInfo = await FileSystem.getInfoAsync(rawPath);

        let size;
        if (fileInfo.exists) {
          size = (fileInfo.size / 1024).toFixed(2);
          console.log(typeof size);

          console.log(size);
        }

        const uploadSize = Number(size) - 400.0;

        console.log("Upload size: ", uploadSize);

        const compressedUri = await compressImage(
          rawPath,
          uploadSize,
          CAMERA_CACHE_DIR
        );
        console.log("Photo compressed", compressedUri);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{ flexGrow: 1, backgroundColor: "#000" }}>
      <CameraView ref={cameraRef} style={{ flex: 1, position: "relative" }}>
        <TouchableOpacity
          delayLongPress={100}
          delayPressOut={100}
          onPress={takePhoto}
          style={{
            padding: 4,
            height: 72,
            width: 72,
            borderRadius: 36,
            zIndex: 30,
            position: "absolute",
            bottom: 30,
            alignSelf: "center",
          }}
          className="bg-white"
        >
          <View className="flex-1 rounded-full border-[1.5px] border-black" />
        </TouchableOpacity>
      </CameraView>
    </View>
  );
}
