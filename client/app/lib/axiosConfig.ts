import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// Create an Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true, // Needed to send cookies with requests
});

// Function to refresh the access token
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await apiClient.get<{ accessToken: string }>(
      "/auth/refresh"
    );
    return response.data.accessToken;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    return null;
  }
};

apiClient.interceptors.response.use(
  (response) => {
    const responseData = response.data
    if (
      responseData &&
      typeof responseData === 'object' &&
      'data' in responseData &&
      'meta' in responseData &&
      'status' in responseData
    ) {
      return { ...response, data: responseData.data }
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      await refreshAccessToken() // Attempt to refresh the access token

      return apiClient(originalRequest) // Retry the original request
    }

    return Promise.reject(error)
  },
)

export default apiClient;
