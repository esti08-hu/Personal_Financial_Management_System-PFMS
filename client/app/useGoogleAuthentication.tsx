import { GoogleLoginResponse } from "@react-oauth/google";

function useGoogleAuthentication() {
  const handleSuccess = (response: GoogleLoginResponse) => {
    if (response.access_token) {
      // Access token is now 'access_token'
      const accessToken = response.access_token;
      console.log(accessToken)

      fetch(`${process.env.NEXT_APP_API_URL}/google-authentication`, {
        method: "POST",
        body: JSON.stringify({
          token: accessToken,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  };

  return {
    handleSuccess,
  };
}
export default useGoogleAuthentication;
