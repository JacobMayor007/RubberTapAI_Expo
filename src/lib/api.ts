import axios from "axios";

import { account } from "../lib/appwrite";

const DEV_URL = "http://192.168.1.16:3000/api/v1";
const PROD_URL = "https://your-production-domain.com/api/v1";

// __DEV__ is true during local development, false in production builds
const baseURL = __DEV__ ? DEV_URL : PROD_URL;

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response, // Pass successful responses through

  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite loops

      try {
        // The Appwrite session is still valid, so we can generate a new 15-min JWT

        const { jwt } = await account.createJWT();

        // Update the header and retry the original request

        originalRequest.headers.Authorization = `Bearer ${jwt}`;

        return api(originalRequest);
      } catch (refreshError) {
        // If createJWT fails, their actual session is dead. Force logout here.

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
