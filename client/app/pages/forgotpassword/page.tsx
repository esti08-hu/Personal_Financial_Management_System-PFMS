import React from "react";
import ForgotPasswordForm from "../../components/ForgotPasswordForm";
import { ToastContainer } from "react-toastify";

const ForgotPasswordPage = () => {
  return (
    <div className="h-screen relative flex justify-center items-center bg-[#E5E5E5]">
      <ForgotPasswordForm />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
      />
    </div>
  );
};

export default ForgotPasswordPage;
