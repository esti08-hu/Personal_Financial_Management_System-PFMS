import React from "react";
import LoginForm from "../../components/LoginForm";
import { ToastContainer } from "react-toastify";

const LoginPage = () => {
  return (
  <div className="h-screen relative flex justify-center items-center bg-gray-100">
      <LoginForm />
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} />
    </div>
  );
};

export default LoginPage;
