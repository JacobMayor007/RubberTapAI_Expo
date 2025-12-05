// Add this utility file: imageCompressionUtil.ts
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

export const compressImage = async (
  uri: string,
  targetSizeKB: number = 300
): Promise<string> => {
  try {
    let currentUri = uri;
    let quality = 0.8;
    let width = 1024;
    let height = 1024;

    // Check file size
    const fileInfo = await FileSystem.getInfoAsync(currentUri);
    let fileSizeKB = 0;

    if (fileInfo.exists && "size" in fileInfo) {
      fileSizeKB = (fileInfo.size || 0) / 1024;
    }

    console.log(`Original file size: ${fileSizeKB.toFixed(2)}KB`);

    // First pass: Resize if too large
    if (fileSizeKB > targetSizeKB * 2) {
      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          currentUri,
          [{ resize: { width, height } }],
          { compress: quality, format: "jpeg" as any }
        );

        currentUri = manipResult.uri;

        const info = await FileSystem.getInfoAsync(currentUri);
        if (info.exists && "size" in info) {
          fileSizeKB = (info.size || 0) / 1024;
        }
        console.log(
          `After first resize: ${fileSizeKB.toFixed(2)}KB (quality: ${quality})`
        );
      } catch (err) {
        console.warn("First pass resize failed, continuing with original");
      }
    }

    let attempts = 0;
    while (fileSizeKB > targetSizeKB && quality > 0.1 && attempts < 5) {
      quality -= 0.15;
      attempts++;

      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          currentUri,
          [{ resize: { width, height } }],
          { compress: quality, format: "jpeg" as any }
        );

        currentUri = manipResult.uri;

        const info = await FileSystem.getInfoAsync(currentUri);
        if (info.exists && "size" in info) {
          fileSizeKB = (info.size || 0) / 1024;
        }
        console.log(
          `Attempt ${attempts}: ${fileSizeKB.toFixed(2)}KB (quality: ${quality.toFixed(2)})`
        );
      } catch (err) {
        console.warn(`Attempt ${attempts} failed, breaking loop`);
        break;
      }
    }

    console.log(`✅ Final compressed size: ${fileSizeKB.toFixed(2)}KB`);
    return currentUri;
  } catch (error) {
    console.error("❌ Compression error:", error);
    return uri; // Return original if compression fails
  }
};
