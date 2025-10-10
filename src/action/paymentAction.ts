import { Alert } from "react-native";
import { globalFunction } from "../global/fetchWithTimeout";

const paymentPost = async (
  id: string,
  API_KEY: string,
  pricing: number,
  title: string,
  period: string,
  benefit_1: string,
  benefit_2: string,
  payment: string
) => {
  try {
    const data = {
      subscriptionType: title,
      period: period,
      price: pricing,
      benefit_1,
      benefit_2,
      userId: id,
      paymentMethod: payment,
      API_KEY,
    };

    const response = await globalFunction.fetchWithTimeout(
      `${process.env.EXPO_PUBLIC_BASE_URL}/payment`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
      20000
    );

    const resJSON = await response.json();

    return Alert.alert(resJSON.title, resJSON.message);
  } catch (error: any) {
    console.error();
  }
};

export { paymentPost };
