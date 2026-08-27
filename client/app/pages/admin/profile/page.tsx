"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import apiClient from "@/app/lib/axiosConfig";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Loader from "@/app/common/Loader";
import Breadcrumb from "@/app/common/Breadcrumbs/Breadcrumb";
import type { Admin } from "@/app/types/user";

const Profile = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-242.5">
        <Breadcrumb pageName="Profile" />

        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="relative z-20 h-35 md:h-65 bg-muted">
            <Image
              src={"/images/cover/cover-01.png"}
              alt="profile cover"
              className="h-full w-full rounded-t-lg object-cover object-center"
              width={970}
              height={260}
              style={{
                width: "auto",
                height: "auto",
              }}
            />
          </div>
          <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
            <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-background p-1 shadow-md sm:h-44 sm:max-w-44 sm:p-3 overflow-hidden">
              <div className="relative h-full w-full rounded-full overflow-hidden">
                <Image
                  src={admin?.profilePicture || "/images/user/user.png"}
                  alt="profile"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="mb-1.5 text-2xl font-semibold text-foreground">
                {admin?.name}
              </h3>
              <p className="font-medium text-muted-foreground">{admin?.role}</p>

              {/* Contact Information */}
              <div className="mt-8 grid gap-4 place-items-center">
                <h4 className="font-semibold text-foreground">
                  Contact Information
                </h4>
                <div className="flex flex-col gap-4 items-start bg-muted/50 p-6 rounded-lg w-full max-w-md">
                  <div className="flex gap-4 items-center w-full justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Email:</p>
                    <p className="font-semibold text-foreground">
                      {admin?.email}
                    </p>
                  </div>
                  <div className="flex gap-4 items-center w-full justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Phone:</p>
                    <p className="font-semibold text-foreground">
                      {admin?.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
