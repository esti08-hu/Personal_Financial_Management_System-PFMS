import { auth, provider } from "@/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../pages/store/authStore";
import apiClient from "../lib/axiosConfig";

const useGoogleAuthentication = () => {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  const handleGoogleSignIn = async (isSignup = false) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const endpoint = isSignup ? "/google/signup" : "/google/signin";
      const response = await apiClient.post(endpoint, { token: idToken });

      const data = response.data?.data || response.data;
      const { accessToken, userId, redirectUrl } = data || {};

      if (accessToken) {
        setToken(accessToken);
        document.cookie = `token=${accessToken}; path=/; secure; samesite=strict`;
      }
      if (userId) {
        document.cookie = `userId=${userId}; path=/; secure; samesite=strict`;
      }

      toast.success(isSignup ? "Sign up successful!" : "Login successful!");
      router.push(redirectUrl || "/pages/user");

      return data;
    } catch (error: any) {
      console.error(
        "Google Sign-In Error:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Google authentication failed. Please try again."
      );
      throw error;
    }
  };

  return { handleGoogleSignIn };
};

export default useGoogleAuthentication;
