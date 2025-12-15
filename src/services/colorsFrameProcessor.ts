// frameProcessors/useColorFrameProcessor.ts
import { runOnJS } from "react-native-reanimated";
import { Frame, useFrameProcessor } from "react-native-vision-camera";

export type RGBColor = { r: number; g: number; b: number };

export const useColorFrameProcessor = (
  onColorDetected: (color: RGBColor) => void
) => {
  return useFrameProcessor((frame: Frame) => {
    "worklet";

    // Only process RGB frames
    if (frame.pixelFormat !== ("RGBA" as any)) {
      return;
    }

    // Get raw bytes
    const buffer = frame.toArrayBuffer();
    const data = new Uint8Array(buffer);

    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    const pixelCount = data.length / 4; // RGBA has 4 bytes per pixel

    // Sample every Nth pixel for speed (e.g., every 10th pixel)
    const step = 10;

    for (let i = 0; i < data.length; i += 4 * step) {
      rSum += data[i]; // Red
      gSum += data[i + 1]; // Green
      bSum += data[i + 2]; // Blue
      // Alpha (data[i+3]) ignored
    }

    const count = pixelCount / step;

    runOnJS(onColorDetected)({
      r: Math.round(rSum / count),
      g: Math.round(gSum / count),
      b: Math.round(bSum / count),
    });
  }, []);
};
