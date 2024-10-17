import React from "react";
import SignupForm from "../../components/SignUpForm";
import { ToastContainer } from "react-toastify";

const SignUpPage = () => {
  return (
    <div className="h-screen relative flex justify-center items-center bg-[#E5E5E5]">
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
