"use client";

import { Icon } from "react-icons-kit";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import { eye } from "react-icons-kit/feather/eye";
import axios from "axios";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GoogleSignUpButton from "./GoogleSignUpButton";
import { signupSchema } from "../common/validationSchema";
import { z } from "zod";
import Confetti from "react-confetti";
import { OrbitProgress } from "react-loading-indicators";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [errors, setErrors] = useState({});
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(eyeOff);

  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = () => {
    if (type === "password") {
      setIcon(eye);
      setType("text");
    } else {
      setIcon(eyeOff);
      setType("password");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Show loading indicator

    try {
      const parsedData = signupSchema.parse(formData);
      const response = await axios.post(
        "http://localhost:3001/auth/register",
        parsedData
      );

      toast.success(response.data.message);

      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        router.push("/login");
      }, 4000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.errors.forEach((error) => {
          fieldErrors[error.path[0]] = error.message;
        });
        setErrors(fieldErrors);
      } else if (axios.isAxiosError(err)) {
        toast.error(err.response.data.message);
        // Handle specific server responses
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false); // Hide loading indicator
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
      className="container max-w-fit h-auto flex justify-center items-center p-4 pl-8 pr-8 border-2 bg-white rounded-lg shadow-lg m-8"
    >
      <AnimatePresence>
        {showConfetti && (
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        )}
      </AnimatePresence>
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
          <h1 className="text-2xl font-black text-[#22577A] mb-4">Sign Up</h1>
          <p className="w-5/6 mb-4 text-[#6C7278]">
            Fill your information below or register using your social account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-md font-medium text-gray-900"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className={`shadow-sm bg-gray-50 text-gray-900 text-sm rounded-lg block w-full p-2.5 pr-10 transition-all duration-300 focus:ring-2 focus:ring-[#37a5bb] ${
                  errors.name
                    ? "border-2 border-red-500"
                    : "border border-gray-300"
                }`}
                required
              />
            </div>
            <div className="min-h-[24px] mt-1">
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-md font-medium text-gray-900"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                className={`shadow-sm bg-gray-50 text-gray-900 text-sm rounded-lg block w-full p-2.5 pr-10 transition-all duration-300 focus:ring-2 focus:ring-[#37a5bb] ${
                  errors.email
                    ? "border-2 border-red-500"
                    : "border border-gray-300"
                }`}
                required
              />
            </div>
            <div className="min-h-[24px] mt-1">
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="">
            <label
              htmlFor="phone"
              className="block mb-2 text-md font-medium text-gray-900"
            >
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                className={`shadow-sm bg-gray-50 text-gray-900 text-sm rounded-lg block w-full p-2.5 pr-10 transition-all duration-300 focus:ring-2 focus:ring-[#37a5bb] ${
                  errors.phone
                    ? "border-2 border-red-500"
                    : "border border-gray-300"
                }`}
                required
              />
            </div>
            <div className="min-h-[24px] mt-1">
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="">
            <label
              htmlFor="password"
              className="block mb-2 text-md font-medium text-gray-900"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={type}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
               className={`shadow-sm bg-gray-50 text-gray-900 text-sm rounded-lg border-2 block w-full p-2.5 ${
                    formData.password.length === 0
                      ? "border-gray-200"
                      : isPasswordValid
                      ? "border-green-400"
                      : "border-red-400"
                  }`}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                onClick={handleToggle}
              >
                <Icon icon={icon} size={20} />
              </button>
            </div>

               <div className="min-h-[24px] mt-1">
              {formData.password.length > 0 && (
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

          <motion.button
            whileTap="tap"
            whileHover="hover"
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center text-white bg-[#00ABCD] hover:bg-[#37a5bb] focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold text-md px-5 py-2.5 text-center rounded-full transition-all duration-300 mt-5"
          >
            Sign Up
          </motion.button>

          <div className="w-full flex justify-around items-center mt-5 mb-5">
            <div className="w-1/3 h-0.5 bg-[#D9D9D9]"></div>
            <div className="">
              <p className="text-center w-fit text-[#b7b7b7]">OR SIGNUP WITH</p>
            </div>
            <div className="w-1/3 h-0.5 bg-[#D9D9D9]"></div>
          </div>

          <div>
            <GoogleSignUpButton />
          </div>
          <label className="text-center">
            <p className="mt-2">
              Already have an account?{" "}
              <span className="text-[#00ABCD] font-black underline">
                <Link href="/login">Log In</Link>
              </span>
            </p>
          </label>
        </form>
      </div>
      <div className="welcome-img hidden lg:block ml-10">
        <Image
          width={500}
          height={500}
          src="/images/welcome.png"
          alt="signup-illustration"
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

export default SignupForm;
