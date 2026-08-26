import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/app/pages/store/authStore";

// Create an Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:3001/api/v1",
  withCredentials: true, // Needed to send cookies with requests
});

// Helper function to handle unauthenticated redirects
const redirectToLogin = () => {
  if (
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/pages/login") &&
    !window.location.pathname.startsWith("/pages/signup") &&
    window.location.pathname !== "/"
  ) {
    useAuthStore.getState().clearUserId();
    window.location.href = "/pages/login";
  }
};

// Function to refresh the access token
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    await apiClient.get("/auth/refresh");
    return true;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    return false;
  }
};

apiClient.interceptors.response.use(
  (response) => {
    const responseData = response.data;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData &&
      "meta" in responseData &&
      "status" in responseData
    ) {
      return { ...response, data: responseData.data };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Prevent infinite loop if refresh request itself fails
    if (originalRequest.url?.includes("/auth/refresh")) {
      redirectToLogin();
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized by attempting token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const isRefreshed = await refreshAccessToken();
      if (isRefreshed) {
        return apiClient(originalRequest);
      } else {
        redirectToLogin();
        return Promise.reject(error);
      }
    }

    // If 401 persists after retry or if connection was refused on protected user pages
    if (error.response?.status === 401 || (error.code === 'ERR_NETWORK' && originalRequest.url?.includes('/user/'))) {
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
