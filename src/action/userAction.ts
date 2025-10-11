import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";
import { ID } from "react-native-appwrite";
import { globalFunction } from "../global/fetchWithTimeout";
import { account, storage } from "../lib/appwrite";

const editName = async (name: string, userId: string, key: string) => {
  try {
    const result = await account.updateName(name);

    if (result.$updatedAt) {
      const data = {
        userId: userId,
        newName: name,
        API_KEY: key,
      };

      const response = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/name`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        },
        30000
      );

      return response;
    }
  } catch (error) {
    console.error(error);
    return;
  }
};

const editEmail = async (
  email: string,
  userId: string,
  key: string,
  password: string
) => {
  try {
    console.log(email, userId, key, password);

    const result = await account.updateEmail(email, password);

    if (result.$updatedAt) {
      await account.createVerification(
        `${process.env.EXPO_PUBLIC_VERIFICATION}/`
      );

      const data = {
        userId: userId,
        newEmail: email,
        API_KEY: key,
      };

      const response = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/email`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        },
        30000
      );

      return response;
    }
  } catch (error) {
    console.error(error);
    return;
  }
};

const updateProfileAction = async (
  userId: string,
  API_KEY: string,
  uri: string
) => {
  try {
    var fileUrl = "";

    if (!uri) {
      return Alert.alert("No Image", "Please enter an image");
    }

    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (!fileInfo.exists) {
      return Alert.alert("No File Info");
    }

    if (fileInfo.exists) {
      const result = await storage.createFile(
        `${process.env.EXPO_PUBLIC_APPWRITE_STORAGE}`,
        ID.unique(),
        {
          uri: uri,
          name: `image_${Date.now()}.jpg`,
          type: "image/jpeg",
          size: fileInfo.size,
        }
      );

      fileUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.EXPO_PUBLIC_APPWRITE_STORAGE}/files/${result.$id}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`;

      const data = {
        userId,
        API_KEY,
        file: fileUrl,
      };

      const response = await globalFunction.fetchWithTimeout(
        `${process.env.EXPO_PUBLIC_BASE_URL}/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        },
        20000
      );

      const jsonData = await response.json();

      return Alert.alert(jsonData.title, jsonData.message);
    }
  } catch (error) {
    console.error(error);
  }
};

export { editEmail, editName, updateProfileAction };
