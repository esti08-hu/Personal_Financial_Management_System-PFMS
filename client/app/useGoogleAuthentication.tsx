import { GoogleLoginResponse } from "@react-oauth/google";

function useGoogleAuthentication() {
  const handleSuccess = (response: GoogleLoginResponse, isSignup: boolean) => {
    console.log(response);
    if (response.credential) {
      const credential = response.credential;
      const endpoint = isSignup ? "signup" : "login";

      fetch(`http://localhost:3001/google-auth/${endpoint}`, {
        method: "POST",
        body: JSON.stringify({ token: credential, endpoint: endpoint }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // This ensures cookies are sent with the request
      })
        .then((res) => res.json()) // Handle the response
        .then((data) => console.log(data)) // Process the data
        .catch((error) => console.error("Error:", error)); // Handle errors
    } else {
      console.error("No credential found in response");
    }
  };

  return {
    handleSuccess,
  };
}

export default useGoogleAuthentication;
