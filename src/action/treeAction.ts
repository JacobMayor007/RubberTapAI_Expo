import * as FileSystem from "expo-file-system";
import { ID } from "react-native-appwrite";
import { globalFunction } from "../global/fetchWithTimeout";
import { storage } from "../lib/appwrite";

const saveTreeToPlot = async (
  user_id: string,
  plot_id: string,
  image_plot: string,
  status: string,
  plot_name: string,
  key: string,
  confidence: number
) => {
  try {
    var fileUrl = "";

    if (image_plot) {
      const fileInfo = await FileSystem.getInfoAsync(image_plot);

      if (!fileInfo.exists) {
        console.error("File does not exist!");
      } else {
        const result = await storage.createFile(
          "686bdf11001233285b53",
          ID.unique(),
          {
            uri: image_plot,
            name: `image_${Date.now()}.jpg`,
            type: "image/jpeg",
            size: fileInfo.size,
          }
        );

        console.log("Image uploaded!", result);

        fileUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/686bdf11001233285b53/files/${result.$id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`;
      }
    }

    const data = {
      userId: user_id,
      fileUrl: fileUrl,
      status: status,
      confidence: confidence,
      plot_id: plot_id,
      plot_name: plot_name,
      API_KEY: key,
    };

    const response = await globalFunction.fetchWithTimeout(
      `${process.env.EXPO_PUBLIC_BASE_URL}/leaves`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(data),
      },
      30000
    );

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

export { saveTreeToPlot };
