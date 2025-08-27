import { Alert } from "react-native";

const paymentPost = async (
  id: string,
  pricing: number,
  title: string,
  period: string,
  benefit_1: string,
  benefit_2: string,
  payment: string
) => {
  try {
    console.log(pricing, title, period, benefit_1, benefit_2, payment);

    return Alert.alert("Working!: " + id);
  } catch (error: any) {
    console.error();
  }
};

export { paymentPost };
