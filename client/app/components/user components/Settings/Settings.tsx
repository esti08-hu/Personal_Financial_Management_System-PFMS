"use client";

import { HiOutlineUser, HiOutlineMail } from "react-icons/hi";
import { useEffect, useState } from "react";
import apiClient from "@/app/lib/axiosConfig";
import { toast } from "sonner";
import Breadcrumb from "../../../common/Breadcrumbs/Breadcrumb";
import ChangePasswordModal from "@/app/components/ChangePassword";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto w-full max-w-5xl px-4 py-8 animate-fade-in relative z-10">
      <Breadcrumb pageName="Settings" />

      <div className="mt-8 flex justify-center w-full">
        <div className="w-full">
          <div className="glass-surface-elevated rounded-3xl border border-sky-400/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),0_0_45px_rgba(125,211,252,0.12)] backdrop-blur-2xl overflow-hidden">
            <div className="border-b border-sky-400/10 bg-slate-50/50 dark:bg-[#0a0e1a]/50 py-6 px-8">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                Personal Information
              </h3>
            </div>
            <div className="p-8">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                      htmlFor="name"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2">
                        <HiOutlineUser className="text-xl text-sky-500" />
                      </span>
                      <input
                        className="glass-input h-12 w-full rounded-xl pl-12 pr-4 border-sky-400/20 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
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
                      className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                      htmlFor="phone"
                    >
                      Phone Number
                    </label>
                    <input
                      className="glass-input h-12 w-full rounded-xl px-4 border-sky-400/20 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                      type="tel"
                      name="phone"
                      id="phone"
                      placeholder="+990 *** ****"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
                      <HiOutlineMail className="text-xl text-sky-500" />
                    </span>
                    <input
                      className="glass-input h-12 w-full rounded-xl pl-12 pr-4 border-sky-400/20 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                      type="email"
                      name="email"
                      id="email"
                      placeholder="devidjond45@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <button
                    onClick={handleEditAdmin}
                    disabled={!isFormChanged}
                    className="flex items-center justify-center h-12 px-8 rounded-xl glass-pill-btn font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-center sm:justify-start w-full">
        <button
          className="flex items-center justify-center h-12 px-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-sm transition-all border border-slate-300 dark:border-slate-700 shadow-sm"
          onClick={toggleChangePasswordModal}
        >
          Change Password
        </button>
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
