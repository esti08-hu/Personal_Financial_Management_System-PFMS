"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import apiClient from "@/app/lib/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import Loader from "@/app/components/admin components/common/Loader";
import Breadcrumb from "@/app/components/admin components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/app/components/admin components/Layouts/DefaultLayout";

const Profile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await apiClient.get("/auth/admin-profile");
        setAdmin(response.data);
      } catch (error) {
        toast.error("An error occurred while fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-242.5">
        <Breadcrumb pageName="Profile" />

        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="relative z-20 h-35 md:h-65">
            <Image
              src={"/images/cover/cover-01.png"}
              alt="profile cover"
              className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
              width={970}
              height={260}
              style={{
                width: "auto",
                height: "auto",
              }}
            />
          </div>
          <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
            <div className="relative overflow-hidden z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
              <div className="relative drop-shadow-2 ">
                <Image
                  src={admin?.profilePicture || "/images/user/user.png"}
                  width={160}
                  height={160}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                  }}
                  alt="profile"
                />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
                {admin?.name}
              </h3>
              <p className="font-medium">{admin?.role}</p>

              {/* New Fields for Email and Phone */}
              <div className="flex justify-center items-center">
                <div className="mt-6 max-w-fit">
                  <h4 className="font-semibold text-black dark:text-white">
                    Contact Information
                  </h4>
                  <div className="mt-4 flex gap-4 items-center">
                    <p className="text-sm font-medium text-gray-600">Email:</p>
                    <p className=" font-semibold text-black dark:text-white">
                      {admin?.email}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-4 items-center">
                    <p className="text-sm font-medium text-gray-600">Phone:</p>
                    <p className=" font-semibold text-black dark:text-white">
                      {admin?.phone}
                    </p>
                  </div>
                </div>
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

export default Profile;
