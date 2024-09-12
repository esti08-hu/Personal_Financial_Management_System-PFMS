"use client";
import React from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import useGoogleAuthentication from "../common/useGoogleAuthentication";
import "dotenv/config";

function GoogleButton() {
  const { handleSuccess } = useGoogleAuthentication();

  return (
    <div className="flex justify-center gap-4">
      <GoogleOAuthProvider clientId="765445772682-ghh5krdtoqdl82geknlpl2b97j0p0jv9.apps.googleusercontent.com">
        {/* Sign Up Button */}
        <GoogleLogin
          onSuccess={(response) => handleSuccess(response, true)} // Pass true to indicate sign-up
          text="signup_with" // Use a custom text for the button
          shape="rectangular"
          size="large"
        />
        
        {/* Login Button */}
        <GoogleLogin
          onSuccess={(response) => handleSuccess(response, false)} // Pass false to indicate login
          text="signin_with" // Use a custom text for the button
          shape="rectangular"
          size="large"
        />
      </GoogleOAuthProvider>
    </div>
  );
}

export default GoogleButton;
