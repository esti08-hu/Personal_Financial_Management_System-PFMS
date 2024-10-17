"use client";

import { useEffect, useState } from "react";
import { Icon } from "react-icons-kit";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import { eye } from "react-icons-kit/feather/eye";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { setNewPasswordSchema } from "../common/validationSchema";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Password from "antd/es/input/Password";
import Loader from "../common/Loader";

const SetNewPasswordForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newPasswordType, setNewPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const [newPasswordIcon, setNewPasswordIcon] = useState(eyeOff);
  const [confirmPasswordIcon, setConfirmPasswordIcon] = useState(eyeOff);

  const handleNewPasswordToggle = () => {
    if (newPasswordType === "password") {
      setNewPasswordIcon(eye);
      setNewPasswordType("text");
    } else {
      setNewPasswordIcon(eyeOff);
      setNewPasswordType("password");
    }
  };

  const handleConfirmPasswordToggle = () => {
    if (confirmPasswordType === "password") {
      setConfirmPasswordIcon(eye);
      setConfirmPasswordType("text");
    } else {
      setConfirmPasswordIcon(eyeOff);
      setConfirmPasswordType("password");
    }
  };

  const [passwordError, setPasswordError] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "newPassword") {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Show loading indicator

    try {
      const parsedData = setNewPasswordSchema.parse(formData);

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      // Ensure the token is present
      if (!token) {
        throw new Error("Token is missing from the URL.");
      }

      const response = await axios.post(
        `http://localhost:3001/auth/reset-password?token=${token}`,
        { newPassword: parsedData.newPassword },
        {
          withCredentials: true,
        }
      );

      const { message } = response.data;

      toast.success(message);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          fieldErrors[error.path[0]] = error.message;
        });
        setErrors(fieldErrors);
      } else if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data.message || "An unexpected error occurred."
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    const hasLowerCase = /[a-z]/;
    const hasUpperCase = /[A-Z]/;

    if (password.length < minLength) {
      setPasswordError("Password must be at least 8 characters long.");
      setIsPasswordValid(false);
    } else if (!hasNumber.test(password)) {
      setPasswordError("Password must contain at least one number.");
      setIsPasswordValid(false);
    } else if (!hasSpecialChar.test(password)) {
      setPasswordError("Password must contain at least one special character.");
      setIsPasswordValid(false);
    } else if (!hasLowerCase.test(password)) {
      setPasswordError("Password must contain at least one lowercase letter.");
      setIsPasswordValid(false);
    } else if (!hasUpperCase.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter.");
      setIsPasswordValid(false);
    } else {
      setPasswordError("");
      setIsPasswordValid(true);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      exit={{ opacity: 0 }}
      className="container border-none max-w-fit h-auto flex justify-center items-center p-8 border-2 bg-white rounded-lg shadow-lg m-8"
    >
       <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute w-full h-full flex justify-center items-center z-50"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="">
        <div>
          <div className="max-w-fit mb-2">
            <Link href="/">
              <Image
                src="/moneymaster.png"
                width={150}
                height={150}
                alt="Money Master Logo"
              />
            </Link>
          </div>
          <h1 className="text-2xl font-black text-[#22577A] mb-6">
            Set New Password
          </h1>
          <p className="max-w-[450px] mb-10 text-[#6C7278]">
            Please enter your new password and confirm it below to complete the
            update.{" "}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block mb-2 text-md font-medium"
            >
              New Password <span className="text-red">*</span>
            </label>
            <div className="relative">
              <input
                type={newPasswordType}
                name="newPassword"
                id="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter New password"
                className={`shadow-sm bg-gray-50 text-sm rounded-lg border-2 block w-full p-2.5 ${
                  formData.newPassword.length === 0
                    ? "border-gray"
                    : isPasswordValid
                    ? "border-green-400"
                    : "border-red"
                }`}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray focus:outline-none"
                onClick={handleNewPasswordToggle}
              >
                <Icon
                  className={newPasswordIcon === eye ? "text-[#00ABCD]" : ""}
                  icon={newPasswordIcon}
                  size={20}
                />
              </button>
            </div>

            <div className="min-h-[24px] mt-1">
              {formData.newPassword.length > 0 && (
                <>
                  {passwordError && (
                    <p className="text-red-500 text-sm">{passwordError}</p>
                  )}
                  {isPasswordValid && !passwordError && (
                    <p className="text-green-500 text-sm">Password is valid</p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block mb-2 text-md font-medium"
            >
              Confirm Password <span className="text-red">*</span>
            </label>
            <div className="relative">
              <input
                type={confirmPasswordType}
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className={`shadow-sm bg-gray-50 text-sm rounded-lg border-2 block w-full p-2.5 ${
                  formData.confirmPassword.length === 0
                    ? "border-gray"
                    : formData.newPassword === formData.confirmPassword
                    ? "border-green-400"
                    : "border-red"
                }`}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray focus:outline-none"
                onClick={handleConfirmPasswordToggle}
              >
                <Icon
                  className={
                    confirmPasswordIcon === eye ? "text-[#00ABCD]" : ""
                  }
                  icon={confirmPasswordIcon}
                  size={20}
                />
              </button>
            </div>
            <div className="min-h-[24px] mt-1">
              {formData.confirmPassword.length > 0 &&
                formData.newPassword !== formData.confirmPassword && (
                  <p className="text-red text-sm">Passwords do not match</p>
                )}
            </div>
          </div>

          <motion.button
            whileTap="tap"
            whileHover="hover"
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center text-white bg-[#00ABCD] hover:bg-[#37a5bb] focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold text-md px-5 py-2.5 text-center rounded-full transition-all duration-300 mb-6"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                viewBox="0 0 24 24"
                aria-labelledby="loadingTitle"
              >
                <title id="loadingTitle">Loading...</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              "Reset Password"
            )}
          </motion.button>
        </form>
      </div>
      <div className="welcome-img hidden lg:block ml-10">
        <Image
          width={500}
          height={500}
          src="/images/resetpassword-illustration.png"
          alt="Login illustration"
          className="object-cover rounded-[20px] shadow-md"
        />
      </div>
    </motion.div>
  );
};

export default SetNewPasswordForm;
