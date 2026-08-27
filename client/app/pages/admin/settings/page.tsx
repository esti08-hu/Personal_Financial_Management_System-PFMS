"use client";

import Breadcrumb from "../../../common/Breadcrumbs/Breadcrumb";
import { User, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import apiClient from "@/app/lib/axiosConfig";
import { toast } from "sonner";
import type { Admin } from "@/app/types/user";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Settings = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
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
        emailAddress: adminData.email || "",
      });
    } catch (error) {
      toast.error("An error occurred while fetching user data.");
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setIsFormChanged(isChanged);
    }
  }, [formData, admin]);

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(
        `/user/update-admin${admin?.pid}`,
        formData
      );
      if (response.status === 200) {
        toast.success("Admin profile updated successfully.");
        fetchAdminData();
      }
    } catch (error) {
      toast.error("An error occurred while fetching user data.");
    }
  };

  return (
    <>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Settings" />

        <div className="grid gap-8 w-full">
          <div className="col-span-5 xl:col-span-3">
            <Card>
              <CardHeader className="border-b border-border mb-4">
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEditAdmin}>
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <Label htmlFor="fullName" className="mb-3 block">
                        Full Name
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <User className="h-5 w-5" />
                        </span>
                        <Input
                          type="text"
                          name="fullName"
                          id="fullName"
                          placeholder="Devid Jhon"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="pl-11"
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <Label htmlFor="phoneNumber" className="mb-3 block text-muted-foreground">
                        Phone Number (Disabled)
                      </Label>
                      <Input
                        type="text"
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder="+990 *** ****"
                        value={"+990 3343 7865"}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <Label htmlFor="emailAddress" className="mb-3 block">
                      Email Address
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail className="h-5 w-5" />
                      </span>
                      <Input
                        type="email"
                        name="emailAddress"
                        id="emailAddress"
                        placeholder="devidjond45@gmail.com"
                        value={formData.emailAddress}
                        onChange={handleInputChange}
                        className="pl-11"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4.5 mt-6">
                    <Button type="submit" disabled={!isFormChanged}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
