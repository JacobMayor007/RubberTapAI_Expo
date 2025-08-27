import { Alert } from "react-native";
import { ID } from "react-native-appwrite";
import { globalFunction } from "../global/fetchWithTimeout";
import { database } from "../lib/appwrite";

const savePlot = async (user_id: string, name: string) => {
  try {
    const plot = await database.createDocument(
      "686156d00007a3127068",
      "68902fe6002b0169dd80",
      ID.unique(),
      {
        user_id,
        name,
      }
    );

    console.log("Plot Created Successfully ", plot.$id);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const deletePlot = async (plot_id: string) => {
  try {
    if (!plot_id) {
      return Alert.alert(
        "Unauthorized",
        "You are not the owner of the rubber tree."
      );
    }

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/plot/${plot_id}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return Alert.alert("Error", "Network Error ");
  }
};

const editPlot = async (
  user_id: string,
  id: string,
  newName: string,
  key: string
) => {
  try {
    if (!user_id) {
      Alert.alert(
        "Unauthorized Access",
        "You are unauthorized for this request"
      );
      return;
    }

    if (!id) {
      Alert.alert("No Plot selected", "Please select a plot");
      return;
    }

    if (!newName) {
      Alert.alert("No new name", "Please enter a name for the plot");
      return;
    }

    const data = {
      id: id,
      userId: user_id,
      newName: newName,
      API_KEY: key,
    };

    console.log("PLot Action: ", key);

    const response = await globalFunction.fetchWithTimeout(
      `${process.env.EXPO_PUBLIC_BASE_URL}/plots`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      },
      30000
    );

    const result = await response.json();

    return Alert.alert(result.title, result.message);
  } catch (error) {
    console.error(error);
    Alert.alert("error", `${error}`);
  }
};

export { deletePlot, editPlot, savePlot };
