"use client";

import { Icon } from "react-icons-kit";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import { eye } from "react-icons-kit/feather/eye";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import GoogleLoginButton from "./GoogleLoginButton";
import { z } from "zod";
import { signinSchema } from "../common/validationSchema";
import { OrbitProgress } from "react-loading-indicators";

const LoginForm = () => {
  const router = useRouter();

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(eyeOff);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmedMessage, setConfirmedMessage] = useState(false);

  const handleCancel = () => {
    setConfirmedMessage(false);
  };

  useEffect(() => {
    const emailConfirmedParam = new URL(window.location.href).searchParams.get(
      "emailConfirmed"
    );
    if (emailConfirmedParam) {
      window.alert(
        "Your email has been confirmed successfully! Please log in."
      );
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleToggle = () => {
    if (type === "password") {
      setIcon(eye);
      setType("text");
    } else {
      setIcon(eyeOff);
      setType("password");
    }
  };

  const handleResend = async () => {
    try {
      const parsedData = signinSchema.parse(formData);
      const email = parsedData.email;

      const response = await axios.post(
        "http://localhost:3001/email-confirmation/resend-confirmation-link",
        { email: email }, // Wrap the email in an object

        {
          withCredentials: true,
        }
      );

      alert("Confirmation link resent!");
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred");
    }
    setConfirmedMessage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Show loading indicator

    try {
      const parsedData = signinSchema.parse(formData);

      const response = await axios.post(
        "http://localhost:3001/auth/login",
        parsedData,
        {
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        router.push("/user");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          fieldErrors[error.path[0]] = error.message;
        });
        setErrors(fieldErrors);
      } else if (axios.isAxiosError(err)) {
        if (
          err.response?.data.message ===
          "Please confirm your email to Login"
        ) {
          setConfirmedMessage(true);
        } else {
          alert(err.response?.data.message || "An unexpected error occurred.");
        }
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };
  return (
    <div className="signupformcontainer h-full flex justify-center items-center bg-[#E5E5E5]">
      <div className="container max-w-fit h-auto flex justify-center items-center gap-16 border-2 pt-10 pb-10 bg-white p-8">
        {isLoading && (
          <div
            className="absolute w-full h-full flex justify-center items-center z-50 "
            style={{ backgroundColor: "rgba(0, 0,0,0, 0.25)" }}
          >
            <OrbitProgress color="#37a5bb" size="medium" />
          </div>
        )}

        {confirmedMessage && (
          <div
            className="absolute w-full h-full flex justify-center items-center z-50 "
            style={{ backgroundColor: "rgba(0, 172, 205, 0.25)" }}
          >
            <div>
              <div className=" overflow-y-auto overflow-x-hidden z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                <div className="relative p-4 w-full max-w-md max-h-full">
                  <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="p-4 md:p-5 text-center">
                      <svg
                        className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                      <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        Confirm your email first to login please.{" "}
                      </h3>
                      <button
                        type="button"
                        onClick={handleResend}
                        className="text-white bg-[#37a5bb] hover:bg-[#24869a]  focus:ring-4 focus:outline-none font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                      >
                        Resend
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                      >
                        No, cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div>
          <div>
            <div className="max-w-fit mb-8">
              <Link href="/">
                <Image
                  src="/moneymaster.png"
                  width={90}
                  height={90}
                  alt="Money Master Logo"
                />
              </Link>
            </div>
            <h1 className="text-2xl font-black text-[#22577A] mb-6">Log In</h1>
            <p className="w-5/6 mb-10 text-[#6C7278]">
              Fill your information below or register using your social account.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-16">
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
                className={`shadow-sm bg-gray-50 text-gray-900 text-sm rounded-lg block w-full p-2.5 ${
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
                  className={`shadow-sm bg-gray-50 text-gray-900 text-sm rounded-lg block w-full p-2.5 ${
                    errors.password
                      ? "border-2 border-red-500"
                      : "border border-gray-300"
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
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="w-full flex justify-center">
              <button
                type="submit"
                className="text-white hover:bg-[#37a5bb] focus:ring-4 focus:outline-none focus:ring-blue-300 text-md px-5 py-2.5 text-center bg-[#00ABCD] font-bold border-2 h-[47px] w-[250px] flex justify-center items-center rounded-full"
              >
                Log In
              </button>
            </div>
            <div className="w-full flex justify-around items-center mt-5 mb-5">
              <div className="w-1/3 h-0.5 bg-[#D9D9D9]"></div>
              <div className="">
                <p className="text-center w-fit text-[#b7b7b7] text-sn">
                  OR LOGIN WITH
                </p>
              </div>
              <div className="w-1/3 h-0.5 bg-[#D9D9D9]"></div>
            </div>

            <div>
              <GoogleLoginButton />
            </div>

            <label className="text-center">
              <p className="mt-10">
                Don’t have an account?{" "}
                <span className="text-[#00ABCD] font-black underline">
                  <Link href={"/signup"}>Sign Up</Link>
                </span>
              </p>
            </label>
          </form>
        </div>
        <div className="welcome-img">
          <Image
            width={500}
            height={100}
            src="/images/login.png"
            alt="Login-img"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
