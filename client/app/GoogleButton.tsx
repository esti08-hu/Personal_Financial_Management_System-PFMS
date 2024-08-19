"use client";
import React from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import useGoogleAuthentication from "./useGoogleAuthentication";
import "dotenv/config";

function GoogleButton() {
  const { handleSuccess } = useGoogleAuthentication();

  return (
    <div className="flex justify-center">
      <GoogleOAuthProvider clientId="765445772682-ghh5krdtoqdl82geknlpl2b97j0p0jv9.apps.googleusercontent.com">
        <GoogleLogin onSuccess={handleSuccess} />
      </GoogleOAuthProvider>
    </div>
  );
}

export default GoogleButton;
