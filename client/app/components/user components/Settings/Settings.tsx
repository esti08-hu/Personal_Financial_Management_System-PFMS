"use client";

import { HiOutlineUser, HiOutlineMail } from "react-icons/hi";
import { useEffect, useState } from "react";
import apiClient from "@/app/lib/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "../../../common/Breadcrumbs/Breadcrumb";
import ChangePasswordModal from "@/app/components/ChangePassword";
import { Button } from "antd";
import type { User } from "@/app/types/user";
import {AxiosError } from "axios";

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  interface ChangePasswordValues {
    currentPassword: string;
    newPassword: string;
  }

  const [isChangePasswordModalVisible, setIsChangePasswordVisible] =
    useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);

  const fetchuserData = async () => {
    try {
      const response = await apiClient.get("/auth/user-profile");
      const userData = response.data;
      setUser(userData);
      setFormData({
        name: userData.name || "",
        phone: userData.phone || "",
        email: userData.email || "",
      });
    } catch (error) {
      toast.error("An error occurred while fetching user data.");
    }
  };

  const handleChangePassword = async (values: ChangePasswordValues) => {
    const pid = user?.pid;
    if (!pid) {
      toast.error("User PID is missing.");
      return;
    }
    try {
      const response = await apiClient.patch("/password/updateUser", {
        pid,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (response.status === 200) {
        toast.success("Password changed successfully!");
        toggleChangePasswordModal();
      } else {
        toast.error("Failed to change password.");
      }
    } catch (err) {
      if(err instanceof AxiosError){
        toast.error(err.response?.data.message);
      }
    }
  };

  const toggleChangePasswordModal = () => {
    setIsChangePasswordVisible(!isChangePasswordModalVisible);
  };

  useEffect(() => {
    fetchuserData();
  }, [user, formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (user) {
      const isChanged =
        formData.name !== user.name ||
        formData.email !== user.email ||
        formData.phone !== user.phone;
      setIsFormChanged(isChanged);
    }
  }, [formData, user]);

  const handleEditAdmin = async () => {
    try {
      const response = await apiClient.put(
        `/user/update-user/${user?.pid}`,
        formData
      );
      if (response.status === 200) {
        toast.success("Admin profile updated successfully.");
      }
    } catch (error) {
      if(error instanceof AxiosError){
        toast.error(error.response?.data.message);
      }
    }
  };

  return (
    <div className="mx-auto max-w-242.5">
      <Breadcrumb pageName="Settings" />

      <div className="gap-8 max-w-5xl p-4 w-full flex justify-center">
        <div className="col-span-5 w-full xl:col-span-3">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Personal Information
              </h3>
            </div>
            <div className="p-7">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="name"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <HiOutlineUser className="text-xl" />
                      </span>
                      <input
                        className="w-full rounded border border-stroke bg-gray-2 py-3 pl-11.5 pr-4.5 text-black focus:border-[#00ABCD] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#00ABCD]"
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Devid Jhon"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="phone"
                    >
                      Phone Number
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray-2 px-4.5 py-3 text-black focus:border-[#00ABCD] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#00ABCD]"
                      type="tel"
                      name="phone"
                      id="phone"
                      placeholder="+990 *** ****"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="mb-5.5">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-4.5 top-4">
                      <HiOutlineMail className="text-xl" />
                    </span>
                    <input
                      className="w-full rounded border border-stroke bg-gray-2 py-3 pl-11.5 pr-4.5 text-black focus:border-[#00ABCD] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#00ABCD]"
                      type="email"
                      name="email"
                      id="email"
                      placeholder="devidjond45@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4.5">
                  <button
                    onClick={handleEditAdmin}
                    className={`flex justify-center rounded px-6 py-2 font-medium text-white ${
                      isFormChanged
                        ? "bg-[#00ABCD] hover:bg-opacity-90"
                        : "bg-gray cursor-not-allowed"
                    }`}
                    type="submit"
                    disabled={!isFormChanged}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <Button
          type="primary"
          className="w-full sm:w-1/3 bg-[#00ABCD] hover:!bg-[#2dc6e5]"
          onClick={toggleChangePasswordModal}
        >
          Change Password
        </Button>
      </div>
      <ChangePasswordModal
        isVisible={isChangePasswordModalVisible}
        toggleModal={toggleChangePasswordModal}
        handleChangePassword={handleChangePassword}
      />
    </div>
  );
};

export default Settings;
