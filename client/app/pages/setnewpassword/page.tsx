import React from "react";
import SetNewPasswordForm from '../../components/SetNewPasswordForm'
import { ToastContainer } from "react-toastify";
const LoginPage = () => {
  return (
    <div className="h-screen relative flex justify-center items-center bg-[#E5E5E5]">
        <SetNewPasswordForm/>
        <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
      />
    </div>
  );
};

export default LoginPage;
