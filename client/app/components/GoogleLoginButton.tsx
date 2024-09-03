import React from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import useGoogleAuthentication from "./useGoogleAuthentication";
import "dotenv/config";

function GoogleLoginButton() {
  const { handleSuccess } = useGoogleAuthentication();

  return (
    <div className="flex justify-center">
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        {/* Login Button */}
        <GoogleLogin
          onSuccess={(response) => handleSuccess(response, false)} // Pass false to indicate login
          onError={() => console.log("Login Failed")}
          type="standard" 
          theme="outline"
          auto_select={false}
          useOneTap={false} 
          promptMomentNotification={(notification) => {
            console.log(notification.getMomentType());
          }}
          context="signin"
          size="large"
          text="signin_with"
          shape="pill"
          logo_alignment="center"
          width={230}
          locale="en"
          click_listener={() => console.log("Button clicked")}
        />
      </GoogleOAuthProvider>
    </div>
  );
}

export default GoogleLoginButton;
