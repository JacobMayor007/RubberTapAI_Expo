import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

export const compressImage = async (
  uri: string,
  targetSizeKB = 300,
  outputDir: string
): Promise<string> => {
  let currentUri = uri;
  let lastTempUri: string | null = null;
  let quality = 0.8;
  let width = 1024;

  try {
    if (!outputDir) {
      throw new Error("outputDir is required");
    }

    const finalOutputUri = outputDir + `compressed-${Date.now()}.jpg`;

    const getSizeKB = async (path: string) => {
      const info = await FileSystem.getInfoAsync(path);
      return info.exists && "size" in info ? (info.size || 0) / 1024 : 0;
    };

    let fileSizeKB = await getSizeKB(currentUri);
    console.log(`Original: ${fileSizeKB.toFixed(2)}KB`);

    // Initial resize if very large
    if (fileSizeKB > targetSizeKB * 2) {
      const result = await ImageManipulator.manipulateAsync(
        currentUri,
        [{ resize: { width } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
      );

      lastTempUri = result.uri;
      currentUri = result.uri;
      fileSizeKB = await getSizeKB(currentUri);
    }

    let attempts = 0;

    while (fileSizeKB > targetSizeKB && quality > 0.1 && attempts < 5) {
      quality -= 0.15;
      attempts++;

      const result = await ImageManipulator.manipulateAsync(
        currentUri,
        [{ resize: { width } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Delete previous temp file
      if (lastTempUri && lastTempUri !== uri) {
        await FileSystem.deleteAsync(lastTempUri, { idempotent: true });
      }

      lastTempUri = result.uri;
      currentUri = result.uri;
      fileSizeKB = await getSizeKB(currentUri);

      console.log(
        `Attempt ${attempts}: ${fileSizeKB.toFixed(2)}KB (q=${quality.toFixed(
          2
        )})`
      );
    }

    // Move final image into our controlled directory
    await FileSystem.moveAsync({
      from: currentUri,
      to: finalOutputUri,
    });

    // Cleanup last temp file if needed
    if (lastTempUri && lastTempUri !== finalOutputUri) {
      await FileSystem.deleteAsync(lastTempUri, { idempotent: true });
    }

    console.log(`✅ Final compressed: ${finalOutputUri}`);
    return finalOutputUri;
  } catch (error) {
    console.error("❌ Compression error:", error);
    return uri;
  }
};
