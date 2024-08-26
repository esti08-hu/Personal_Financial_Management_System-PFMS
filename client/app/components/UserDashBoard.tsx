"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { OrbitProgress } from "react-loading-indicators";

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState({
    name: "",
    email: "",
    profilePicture: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/auth/user-profile",
          {
            withCredentials: true,
          }
        );

        setUser({
          name: response.data.name,
          email: response.data.email,
          profilePicture: response.data.profilePicture,
        });
      } catch (err) {
        toast.error(
          "An error occurred while fetching user data. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3001/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast.success("Logout successful!");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      toast.error("An error occurred during logout. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-col w-1/3 container max-w-fit h-auto flex justify-center items-center p-8 border-2 bg-white rounded-lg shadow-lg m-10"
    >
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute w-full h-full flex justify-center items-center z-50"
          style={{ backgroundColor: "rgba(0, 172, 205, 0.25)" }}
        >
          <OrbitProgress color="#37a5bb" size="medium" />
        </motion.div>
      )}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Image
          src={user.profilePicture || "/user.png"}
          alt="Profile"
          width={96}
          height={96}
          className="rounded-full mb-4"
        />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-bold mb-2"
      >
        {user.name}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 mb-4"
      >
        {user.email}
      </motion.p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={handleLogout}
        className="text-white hover:bg-[#37a5bb] focus:ring-4 focus:outline-none focus:ring-blue-300 text-md px-5 py-2.5 text-center bg-[#00ABCD] font-bold border-2 h-[47px] w-[250px] flex justify-center items-center rounded-full"
      >
        Logout
      </motion.button>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </motion.div>
  );
};

export default Dashboard;
