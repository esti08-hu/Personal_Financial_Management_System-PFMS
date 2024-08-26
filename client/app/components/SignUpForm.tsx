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

      alert(response.data.message);

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
        alert(err.response.data.message);
        // Handle specific server responses
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (password.length < minLength) {
      setPasswordError("Password must be at least 8 characters long.");
    } else if (!hasNumber.test(password)) {
      setPasswordError("Password must contain at least one number.");
      setIsPasswordValid(false);
    } else if (!hasSpecialChar.test(password)) {
      setPasswordError("Password must contain at least one special character.");
      setIsPasswordValid(false);
    } else {
      setPasswordError("");
      setIsPasswordValid(true);
    }
  };

  return (
    <div className="signupformcontainer h-full flex justify-center items-center bg-[#E5E5E5]">
      {showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}
      <div className="container  max-w-fit max-h-fit flex justify-center items-center gap-16 border-2 pt-10 pb-10 bg-white p-8">
        {isLoading && (
          <div
            className="absolute w-full h-full flex justify-center items-center z-50 "
            style={{ backgroundColor: "rgba(0, 172, 205, 0.25)" }}
            >
            <OrbitProgress color="#37a5bb" size="medium" />
          </div>
        )}
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
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`shadow-sm bg-gray-50 text-gray-900 text-sm rounded-lg block w-full p-2.5 ${
                  errors.name
                    ? "border-2 border-red-500"
                    : "border border-gray-300"
                }`}
                placeholder="Enter your name"
                required
              />
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
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                className={`shadow-sm bg-gray-50 text-gray-900 text-sm rounded-lg block w-full p-2.5 ${
                  errors.email
                    ? "border-2 border-red-500"
                    : "border border-gray-300"
                }`}
                required
              />
              <div className="min-h-[24px] mt-1">
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block mb-2 text-md font-medium text-gray-900"
              >
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                className={`shadow-sm bg-gray-50 text-gray-900 text-sm rounded-lg block w-full p-2.5 ${
                  errors.phone
                    ? "border-2 border-red-500"
                    : "border border-gray-300"
                }`}
                required
              />
              <div className="min-h-[24px] mt-1">
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="mb-5">
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
                      ? "border-green-600"
                      : "border-red-600"
                  }`}
                  required
                />
                <span
                  className=" absolute right-10 top-0 mt-2 mr-2 cursor-pointer"
                  onClick={handleToggle}
                >
                  <Icon className="absolute mr-10" icon={icon} size={25} />
                </span>
              </div>

              <div className="min-h-[24px] mt-1">
                {formData.password.length > 0 && (
                  <>
                    {passwordError && (
                      <p className="text-red-500 text-sm">{passwordError}</p>
                    )}
                    {isPasswordValid && !passwordError && (
                      <p className="text-green-500 text-sm">
                        Password is valid
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="text-white hover:bg-[#37a5bb] focus:ring-4 focus:outline-none focus:ring-blue-300 text-md px-5 py-2.5 text-center bg-[#00ABCD] font-bold border-2 h-[47px] w-[250px] flex justify-center items-center rounded-full"
              >
                Sign Up
              </button>
            </div>

            <div className="w-full flex justify-around items-center mt-5 mb-5">
              <div className="w-1/3 h-0.5 bg-[#D9D9D9]"></div>
              <div className="">
                <p className="text-center w-fit text-[#b7b7b7]">
                  OR SIGNUP WITH
                </p>
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
        <div className="welcome-img">
          <Image
            width={500}
            height={500}
            src="/images/welcome.png"
            alt="signup-illustration"
          />
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
