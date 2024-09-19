"use client";

import Breadcrumb from "../../../components/admin components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "../../../components/admin components/Layouts/DefaultLayout";
import { HiOutlineUser, HiOutlineMail } from "react-icons/hi";
import { useEffect, useState } from "react";
import apiClient from "@/app/lib/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Settings = () => {
  const [admin, setAdmin] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    // phoneNumber: "",
    emailAddress: "",
  });
  const [isFormChanged, setIsFormChanged] = useState(false);
  const fetchAdminData = async () => {
    try {
      const response = await apiClient.get("/auth/admin-profile");
      const adminData = response.data;
      setAdmin(response.data);
      setFormData({
        fullName: adminData.name || "",
        // phoneNumber: "+990 3343 7865", // Assuming the phone number is static for now
        emailAddress: adminData.email || "",
      });
    } catch (error) {
      toast.error("An error occurred while fetching user data.");
    } finally {
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (admin) {
      const isChanged =
        formData.fullName !== admin.name ||
        formData.emailAddress !== admin.email;
      // formData.phoneNumber !== "+990 3343 7865";
      setIsFormChanged(isChanged);
    }
  }, [formData, admin]);

  const handleEditAdmin = async () => {
    try {
      const response = await apiClient.put(
        `/user/update-admin${admin.pid}`,
        formData
      );
      if (response.status === 200) {
        toast.success("Admin profile updated successfully.");
        fetchAdminData();
      }
    } catch (error) {
      toast.error("An error occurred while fetching user data.");
    } finally {
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Settings" />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Personal Information
                </h3>
              </div>
              <div className="p-7">
                <form action="#">
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="fullName"
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
                          name="fullName"
                          id="fullName"
                          placeholder="Devid Jhon"
                          value={formData.fullName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="phoneNumber"
                      >
                        Phone Number
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray-2 px-4.5 py-3 text-black focus:border-[#00ABCD] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#00ABCD]"
                        type="text"
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder="+990 *** ****"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="emailAddress"
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
                        name="emailAddress"
                        id="emailAddress"
                        placeholder="devidjond45@gmail.com"
                        value={formData.emailAddress}
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
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </DefaultLayout>
  );
};

export default Settings;
