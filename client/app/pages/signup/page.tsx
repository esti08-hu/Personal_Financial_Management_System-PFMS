import SignupForm from "@/app/components/SignUpForm";
import React from "react";
import { ToastContainer } from "react-toastify";

const SignUpPage = () => {
  return (
  <div className="h-screen relative flex justify-center items-center bg-gray-100">
      <SignupForm />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
      />
    </div>
  );
};

export default SignUpPage;
