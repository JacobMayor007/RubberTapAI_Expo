import { CameraView } from "expo-camera";
import * as FileSystem from "expo-file-system";
import { useEffect, useRef, useState } from "react";
import { Alert, SafeAreaView, TouchableOpacity, View } from "react-native";
import { compressImage } from "../services/imageCompressionUtil";
import BackgroundGradient from "./BackgroundGradient";
import Loading from "./LoadingComponent";
import TreeMeasurementGuidance from "./TreeMeasurementGuidance";

const CAMERA_CACHE_DIR = FileSystem.cacheDirectory + "distance-checker/";
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

type DistanceCheckerProps = {
  setDistance: (right: boolean) => void;
};

export default function DistanceChecker({ setDistance }: DistanceCheckerProps) {
  const cameraRef = useRef<CameraView>(null);
  const [half, setHalf] = useState(false);
  const [status, setStatus] = useState(false);
  const wsServer1Ref = useRef<WebSocket | null>(null);
  const [disable, setDisable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TMResponse | null>(null);

  useEffect(() => {
    FileSystem.makeDirectoryAsync(CAMERA_CACHE_DIR, {
      intermediates: true,
    });

    Alert.alert(
      "🔔Reminder:",
      "The rubber tree trunk should be the center of the camera. Have fun and enjoy measuring"
    );

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

  useEffect(() => {
    // Prediction WS
    const wsPred = new WebSocket("https://rubbertapai-measure.onrender.com");
    wsPred.onopen = () =>
      console.log("✅ Prediction 1 Measure Distance connected");
    wsPred.onmessage = (msg) =>
      console.log("Prediction WS Measure Distance:", msg.data);
    wsPred.onerror = (err) => console.error(err);
    wsServer1Ref.current = wsPred;

    return () => {
      wsPred.close();
    };
  }, []);

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      setDisable(true);

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
        await uploadImage(compressedUri);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const uploadImage = async (uri: string) => {
    if (
      !wsServer1Ref.current ||
      wsServer1Ref.current.readyState !== WebSocket.OPEN
    ) {
      Alert.alert("WebSocket not connected", "Please try again.");
      setDisable(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(uri);
      const blob = await response.blob();

      const base64data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      });

      // Server 1: Validate it's a rubber tree leaf
      const server1Result = await sendToServer(
        wsServer1Ref.current,
        base64data
      );

      if (!server1Result || !server1Result.predictions) {
        Alert.alert("Error", "Failed to get response from Server 1");
        setLoading(false);
        setDisable(false);
        return;
      }

      setResults(server1Result);
      console.log(results);
      const result = await resultImage(server1Result.predictions);
      switch (result) {
        case "Too Close":
          Alert.alert(
            "⚠️ Measuring Distance Warning",
            "You are too close from the rubber tree, please take one step back. Please try again!"
          );
          break;
        case "Too Far":
          Alert.alert(
            "⚠️ Measuring Distance Warning",
            "You are too far from the rubber tree, please take one step closer. Please try again!"
          );
          break;
        case "No Tree":
          Alert.alert(
            "⚠️ Measuring Distance Warning",
            "Please make sure the rubber tree is present and at the center of the camera. Please try again!"
          );
          break;
        case "Right Distance":
          Alert.alert(
            "✅ Measuring Distance Successful",
            "Congratulations! You are in a correct distace. Now, you can measure your rubber tree. Make sure it is inside the center of the camera"
          );
          setDistance(true);

          break;
        default:
          Alert.alert(
            "⚠️ Measuring Distance Error",
            "There is an error occured. Please try again!"
          );
      }

      setLoading(false);
      setDisable(false);
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "Failed to process image");
      setLoading(false);
      setDisable(false);
    }
  };

  const resultImage = async (results: Prediction[]) => {
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

  const sendToServer = (
    ws: WebSocket | null,
    base64data: string
  ): Promise<TMResponse> => {
    return new Promise((resolve, reject) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not connected"));
        return;
      }

      const timeout = setTimeout(() => {
        ws.removeEventListener("message", handleMessage);
        reject(new Error("Server response timeout"));
      }, 30000);

      const handleMessage = (event: any) => {
        try {
          clearTimeout(timeout);
          ws.removeEventListener("message", handleMessage);
          const data: TMResponse = JSON.parse(event.data);
          resolve(data);
        } catch (error) {
          clearTimeout(timeout);
          ws.removeEventListener("message", handleMessage);
          reject(error);
        }
      };

      ws.addEventListener("message", handleMessage);

      ws.send(
        JSON.stringify({
          type: "frame",
          frameData: base64data,
        })
      );
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <BackgroundGradient className="flex-1 items-center justify-center">
          <Loading className="h-16 w-16 my-auto" />
        </BackgroundGradient>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flexGrow: 1, backgroundColor: "#000" }}>
      <CameraView ref={cameraRef} style={{ flex: 1, position: "relative" }}>
        <TreeMeasurementGuidance
          cameraRef={cameraRef}
          isMeasuring={!half}
          setStatus={setStatus}
        />

        <TouchableOpacity
          delayLongPress={100}
          delayPressOut={100}
          disabled={status || disable}
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
          className={`${status ? `bg-gray-500` : `bg-white`}`}
        >
          <View className="flex-1 rounded-full border-[1.5px] border-black" />
        </TouchableOpacity>
      </CameraView>
    </View>
  );
}
