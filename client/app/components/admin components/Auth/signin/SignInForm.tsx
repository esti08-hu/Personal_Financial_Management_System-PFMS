"use client";

import { Icon } from "react-icons-kit";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import { eye } from "react-icons-kit/feather/eye";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { adminSigninSchema } from "@/app/common/validationSchema";
import Loader from "../../common/Loader";

const AdminSignInForm = () => {
  const router = useRouter();

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    isAdmin: true,
  });
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(eyeOff);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); 

    try {
      const parsedData = adminSigninSchema.parse(formData); 
      const response = await axios.post(
        "http://localhost:3001/auth/login",
        parsedData,
        {
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        // Status should be 200
        toast.success("Logged in successfully!");
        setTimeout(() => {
          router.push("/pages/admin/dashboard"); // Redirect to admin dashboard
        }, 1000);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          fieldErrors[error.path[0]] = error.message;
        });
        setErrors(fieldErrors);
      } else if (axios.isAxiosError(err)) {
        toast.error(err.response?.data.message || "An error occurred.");
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
      className="container border-none max-w-fit h-auto flex justify-center items-center p-8 border-2 bg-white rounded-lg shadow-lg m-10"
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
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <div className="max-w-fit mb-8">
          <Image
            src="/moneymaster.png"
            width={150}
            height={150}
            alt="Money Master Logo"
          />
        </div>
        <h1 className="text-2xl font-black text-[#22577A] mb-6">
          Admin Sign In
        </h1>
        <p className="w-[450px] mb-10 text-[#6C7278]">
          Enter your admin credentials to sign in.
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block mb-2 text-md font-medium text-black"
            >
              Email <span className="text-red">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`shadow-sm bg-gray-50 text-black text-sm rounded-lg block w-full p-2.5 pr-10 transition-all duration-300 focus:ring-2 focus:ring-[#37a5bb] ${
                errors.email ? "border-2 border-red" : "border border-gray"
              }`}
              placeholder="Enter admin email"
              required
            />
            <div className="min-h-[24px] mt-1">
              {errors.email && (
                <p className="text-red text-sm">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block mb-2 text-md font-medium text-black"
            >
              Password <span className="text-red">*</span>
            </label>
            <div className="relative">
              <input
                type={type}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className={`shadow-sm bg-gray-50 text-sm text-black rounded-lg block w-full p-2.5 pr-10 transition-all duration-300 focus:ring-2 focus:ring-[#37a5bb] ${
                  errors.password ? "border-2 border-red" : "border border-gray"
                }`}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray focus:outline-none"
                onClick={handleToggle}
              >
                <Icon
                  className={icon === eye ? "text-[#00ABCD]" : ""}
                  icon={icon}
                  size={20}
                />
              </button>
            </div>

            <div className="min-h-[24px] mt-1">
              {errors.password && (
                <p className="text-red text-sm">{errors.password}</p>
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
              "Sign In"
            )}
          </motion.button>
        </form>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </motion.div>
  );
};

export default AdminSignInForm;
