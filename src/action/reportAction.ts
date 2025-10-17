import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";
import { ID } from "react-native-appwrite";
import { storage } from "../lib/appwrite";

const reportUserFetch = async (
  reportedBy: string,
  reportedBy_Name: string,
  reportedBy_Image: string,
  reported_id: string,
  reported_id_name: string,
  reported_id_image: string,
  description: string,
  type: string,
  image_proof: string,
  API_KEY: string
) => {
  try {
    var fileUrl = "";

    if (image_proof) {
      const fileInfo = await FileSystem.getInfoAsync(image_proof);

      if (!fileInfo.exists) {
        console.error("File does not exist!");
      } else {
        const result = await storage.createFile(
          `${process.env.EXPO_PUBLIC_APPWRITE_STORAGE}`,
          ID.unique(),
          {
            uri: image_proof,
            name: `image_${Date.now()}.jpg`,
            type: "image/jpeg",
            size: fileInfo.size,
          }
        );

        console.log("Image uploaded!", result);

        fileUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.EXPO_PUBLIC_APPWRITE_STORAGE}/files/${result.$id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`;
      }
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        userId: reportedBy,
        reportedBy_Name,
        reportedBy_Image,
        reported_id,
        reported_id_name,
        reported_id_image,
        type,
        description,
        proof: fileUrl,
        API_KEY,
      }),
    });

    // First get the raw response text
    const responseText = await response.text();

    // Try to parse it as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON:", responseText);
      throw new Error("Server returned invalid response");
    }

    // Check for error responses (4xx, 5xx)
    if (!response.ok) {
      const errorMessage = result.message || "Server request failed";
      Alert.alert("Error", errorMessage);
      throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    console.error("Report submission error:", error);
  }
};

export { reportUserFetch };
