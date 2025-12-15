import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

interface Prediction {
  className: string;
  probability: number;
}

export default function LiveDetection() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const webviewRef = useRef<WebView>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (isReady && permission?.granted) {
      startProcessing();
    }
  }, [isReady, permission?.granted]);

  const startProcessing = () => {
    const processFrame = async () => {
      if (!cameraRef.current || !webviewRef.current || processingRef.current) {
        setTimeout(processFrame, 100);
        return;
      }

      processingRef.current = true;

      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.3,
          base64: true,
          skipProcessing: true,
        });

        if (photo?.base64) {
          webviewRef.current.injectJavaScript(`
            if (window.predictImage) {
              window.predictImage('data:image/jpeg;base64,${photo.base64}');
            }
            true;
          `);
        }
      } catch (error) {
        // Silently continue
      }

      processingRef.current = false;
      setTimeout(processFrame, 100); // ~10 FPS
    };

    processFrame();
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "ready") {
        setIsReady(true);
        console.log("✅ Model loaded");
      } else if (data.type === "predictions") {
        setPredictions(data.predictions);
      } else if (data.type === "log") {
        console.log("🔍", data.message);
      }
    } catch (error) {
      console.error("Parse error:", error);
    }
  };

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: transparent; }
    img { display: none; }
  </style>
</head>
<body>
<img id="inputImage" />

<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js"></script>
<script>
    let model;
    const URL = "https://teachablemachine.withgoogle.com/models/BdvowgOpC/";
    const img = document.getElementById('inputImage');
    let isProcessing = false;

    function sendMessage(type, data = {}) {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...data }));
        }
    }

    // Load model
    (async function() {
        try {
            sendMessage('log', { message: 'Loading model...' });
            model = await tmImage.load(URL + "model.json", URL + "metadata.json");
            sendMessage('log', { message: 'Model loaded!' });
            sendMessage('ready');
        } catch (err) {
            sendMessage('log', { message: 'Error: ' + err.message });
        }
    })();

    // Process image from React Native
    window.predictImage = async function(base64Image) {
        if (!model || isProcessing) return;
        
        isProcessing = true;
        
        try {
            img.src = base64Image;
            
            await new Promise((resolve) => {
                if (img.complete) resolve(null);
                else img.onload = () => resolve(null);
            });

            const prediction = await model.predict(img);
            const predictions = prediction
                .map(p => ({
                    className: p.className,
                    probability: Math.round(p.probability * 100)
                }))
                .sort((a, b) => b.probability - a.probability);
            
            sendMessage('predictions', { predictions });
        } catch (err) {
            console.error('Prediction error:', err);
        } finally {
            isProcessing = false;
        }
    };
</script>
</body>
</html>
  `;

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>📷 Camera Permission Required</Text>
          <Text style={styles.errorMessage}>
            This app needs camera access for object detection.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Native Camera */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="front"
      />

      {/* Hidden WebView for AI */}
      <WebView
        ref={webviewRef}
        source={{ html: htmlContent }}
        style={{ width: 0, height: 0, opacity: 0 }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />

      {/* UI Overlay */}
      <View style={styles.overlay}>
        <View style={styles.statusBar}>
          <View style={[styles.statusDot, isReady && styles.statusDotActive]} />
          <Text style={styles.statusText}>
            {isReady ? "🟢 LIVE" : "⚪ Loading..."}
          </Text>
        </View>

        {predictions.length > 0 && (
          <View style={styles.resultContainer}>
            <Text style={styles.title}>🎯 Live Detection</Text>

            <View
              style={[
                styles.topResult,
                predictions[0].className === "Face" && styles.topResultFace,
                predictions[0].className === "Phone" && styles.topResultPhone,
              ]}
            >
              <Text style={styles.className}>{predictions[0].className}</Text>
              <Text style={styles.probability}>
                {predictions[0].probability}%
              </Text>
            </View>

            <View style={styles.allResults}>
              {predictions.map((pred, index) => (
                <View key={index} style={styles.resultRow}>
                  <Text style={styles.resultLabel}>{pred.className}</Text>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.confidenceBar,
                        { width: `${pred.probability}%` },
                        pred.className === "Face" && styles.barFace,
                        pred.className === "Phone" && styles.barPhone,
                      ]}
                    />
                  </View>
                  <Text style={styles.resultValue}>{pred.probability}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: { ...StyleSheet.absoluteFillObject, pointerEvents: "box-none" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  errorTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  permissionButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  statusBar: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#666" },
  statusDotActive: { backgroundColor: "#4CAF50" },
  statusText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  resultContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.92)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: "rgba(76,175,80,0.5)",
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  topResult: {
    backgroundColor: "#2196F3",
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  topResultFace: { backgroundColor: "#4CAF50" },
  topResultPhone: { backgroundColor: "#FF9800" },
  className: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  probability: { color: "#fff", fontSize: 22, marginTop: 6, fontWeight: "600" },
  allResults: { gap: 14 },
  resultRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  resultLabel: { color: "#fff", width: 75, fontSize: 14, fontWeight: "500" },
  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 5,
    overflow: "hidden",
  },
  confidenceBar: {
    height: "100%",
    backgroundColor: "#2196F3",
    borderRadius: 5,
  },
  barFace: { backgroundColor: "#4CAF50" },
  barPhone: { backgroundColor: "#FF9800" },
  resultValue: {
    color: "#fff",
    width: 50,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
  },
});
