import React from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import useGoogleAuthentication from "../common/useGoogleAuthentication";
import "dotenv/config";

function GoogleSignUpButton() {
  const { handleSuccess } = useGoogleAuthentication();

  return (
    <div className="flex justify-center gap-4">
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        {/* Sign Up Button */}
        <GoogleLogin
          onSuccess={(response) => handleSuccess(response, true)} // Pass true to indicate signup
          onError={() => console.log("Signup Failed")}
          type="standard"
          theme="outline"
          auto_select={false}
          useOneTap={false}
          promptMomentNotification={(notification) => {
            console.log(notification.getMomentType());
          }}
          context="signup"
          size="large"
          text="signup_with" // Corrected to reflect "Sign up with Google"
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

export default GoogleSignUpButton;
