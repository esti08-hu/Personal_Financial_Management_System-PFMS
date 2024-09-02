"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { forgotPasswordSchema } from "../common/validationSchema";
import { OrbitProgress } from "react-loading-indicators";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPasswordForm = () => {
  const router = useRouter();

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Show loading indicator

    try {
      const parsedData = forgotPasswordSchema.parse(formData);
      const response = await axios.post(
        "http://localhost:3001/auth/forgot-password",
        parsedData,
        {
          withCredentials: true,
        }
      );

      const { message } = response.data;

      toast.success(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          fieldErrors[error.path[0]] = error.message;
        });
        setErrors(fieldErrors);
      } else if (axios.isAxiosError(err)) {
        if (
          err.response?.data.message === "Please confirm your email to Login"
        ) {
          setConfirmedMessage(true);
        } else {
          toast.error(
            err.response?.data.message || "An unexpected error occurred."
          );
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
      className="container max-w-fit h-auto flex justify-center items-center p-4 pl-8 pr-8 border-2 bg-white rounded-lg shadow-lg m-8"
    >
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute w-full h-full flex justify-center items-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.25)" }}
          >
            <OrbitProgress color="#37a5bb" size="medium" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="">
        <div>
          <div className="max-w-fit mb-2">
            <Link href="/">
              <Image
                src="/moneymaster.png"
                width={90}
                height={90}
                alt="Money Master Logo"
              />
            </Link>
          </div>
          <h1 className="text-2xl font-black text-[#22577A] mb-6">
            Forgot Passwrod
          </h1>
          <p className="w-5/6 mb-10 text-[#6C7278]">
            Fill your information below or register using your social account.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block mb-2 text-md font-medium text-gray-900"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`shadow-sm bg-gray-50 text-gray-900 text-sm rounded-lg block w-full p-2.5 pr-10 transition-all duration-300 focus:ring-2 focus:ring-[#37a5bb] ${
                errors.email
                  ? "border-2 border-red-500"
                  : "border border-gray-300"
              }`}
              placeholder="Enter email"
              required
            />
            <div className="min-h-[24px] mt-1">
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
          </div>

          <motion.button
            whileTap="tap"
            whileHover="hover"
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center text-white bg-[#00ABCD] hover:bg-[#37a5bb] focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold text-md px-5 py-2.5 text-center rounded-full transition-all duration-300 mb-10"
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
              "Submit"
            )}
          </motion.button>

          <label className="text-center">
            <p className="mt-10">
              Remember Password?{" "}
              <span className="text-[#00ABCD] font-black underline">
                <Link href={"/login"}>Sign In</Link>
              </span>
            </p>
          </label>
        </form>
      </div>
      <div className="welcome-img hidden lg:block ml-10">
        <Image
          width={500}
          height={500}
          src="/images/login.png"
          alt="Login illustration"
          className="object-cover rounded-lg shadow-md"
        />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </motion.div>
  );
};

export default ForgotPasswordForm;
