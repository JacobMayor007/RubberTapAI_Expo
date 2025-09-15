import { globalFunction } from "../global/fetchWithTimeout";
import { account } from "../lib/appwrite";

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
      await account.createVerification("https://rubbertapai.netlify.app/");

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

export { editEmail, editName };
