"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import apiClient from "@/app/lib/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import type { User } from "@/app/types/user";
import Loader from "../../common/Loader";
import Breadcrumb from "../../common/Breadcrumbs/Breadcrumb";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get("/auth/user-profile");
        setUser(response.data);
      } catch (error) {
        toast.error("An error occurred while fetching user data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 w-full">
        <Loader />
      </div>
    )
  }

  return (
    
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
          <div className="px-4 pb-2 text-center lg:pb-4 xl:pb-11.5">
            <div className="relative max-w-10 z-30 mx-auto -mt-22 h-20 w-full rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3 overflow-hidden">
              <div className="relative drop-shadow-2 overflow-hidden">
                <Image
                  src={user?.profilePicture || "/images/user/user.png"}
                  width={130}
                  height={130}
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
                {user?.name}
              </h3>
              <p className="font-medium">{user?.role}</p>

              {/* New Fields for Email and Phone */}
              <div className="flex justify-center items-center">
                <div className="mt-6 max-w-fit">
                  <h4 className="font-semibold text-black dark:text-white">
                    Contact Information
                  </h4>
                  <div className="mt-4 flex gap-4 items-center">
                    <p className="text-sm font-medium text-gray-600">Email:</p>
                    <p className=" font-semibold text-black dark:text-white">
                      {user?.email}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-4 items-center">
                    <p className="text-sm font-medium text-gray-600">Phone:</p>
                    <p className=" font-semibold text-black dark:text-white">
                      {user?.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer
        position="top-center"
        autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          pauseOnFocusLoss
        />
      </div>
  );
};

export default Profile;
