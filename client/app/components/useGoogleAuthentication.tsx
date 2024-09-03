import { GoogleLoginResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

function useGoogleAuthentication() {
  const router = useRouter();

  const handleSuccess = (response: GoogleLoginResponse, isSignup: boolean) => {
    if (response.credential) {
      const credential = response.credential;
      const endpoint = isSignup ? "signup" : "signin";

      fetch(`http://localhost:3001/google/${endpoint}`, {
        method: "POST",
        body: JSON.stringify({ token: credential, endpoint: endpoint }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // This ensures cookies are sent with the request
      })
        .then((res) => res.json()) // Handle the response
        .then((data) => {
          if(data.redirectUrl){
            router.push(data.redirectUrl);
          }else if (data.message){
            toast.error(data.message);
          }else {
            toast.error("Sign-in successful, but no redirect URL found. Please try again.");
          }
        })
        .catch((error) => {
         toast.error("An error occurred. Please try again.");
        });
    } else {
      toast.error("No credential found. Please try again.");
    }
  };

  return {
    handleSuccess,
  };
}

export default useGoogleAuthentication;
