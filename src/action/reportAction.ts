import { Alert } from "react-native";

const reportUserFetch = async (
  reported_id: string,
  reportedBy: string,
  type: string,
  description: string
) => {
  try {
    // Validate inputs
    if (!reported_id || !reportedBy || !type || !description) {
      Alert.alert("Error", "Please fill out all required fields");
      throw new Error("Missing required fields");
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        reported_id,
        reportedBy,
        type,
        description,
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

    throw error;
  }
};

export { reportUserFetch };
