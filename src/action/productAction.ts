import dayjs from "dayjs";
import { globalFunction } from "../global/fetchWithTimeout";

const deleteProduct = async (
  user_id: string,
  product_id: string,
  key: string
) => {
  try {
    dayjs();
    console.log(`Action: ${dayjs().hour()}`, product_id, user_id, key);

    const data = {
      userId: user_id || "",
      API_KEY: key || "",
      productId: product_id || "",
    };

    const response = await globalFunction.fetchWithTimeout(
      `${process.env.EXPO_PUBLIC_BASE_URL}/products`,
      {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      },
      20000
    );

    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export { deleteProduct };
