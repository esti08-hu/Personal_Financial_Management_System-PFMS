import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ClickOutside from "../ClickOutside";
import {
  HiChevronDown,
  HiOutlineUserCircle,
  HiOutlineCog,
  HiOutlineLogout,
} from "react-icons/hi";
import apiClient from "@/app/lib/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await apiClient.get("/auth/admin-profile");
        setAdmin(response.data);
      } catch (error) {
        toast.error("An error occurred while fetching user data.");
      } finally {
      }
    };

    fetchAdminData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await apiClient.post("/auth/logout");
      if (response.status === 200) {
        toast.success("Logout successful!");
        setTimeout(() => router.push("/pages/admin/auth/signin"), 2000);
      }
    } catch (err) {
      toast.error("An error occurred during logout.");
    }
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        href="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {admin?.name}
          </span>
          <span className="block text-xs">{admin?.role}</span>
        </span>

        <span className="h-12 w-12 rounded-full">
          <Image
            width={112}
            height={112}
            src={admin?.profilePicture || "/images/user/user.png"}
            style={{
              width: "auto",
              height: "auto",
            }}
            alt="User"
          />
        </span>

        <HiChevronDown className="text-xl" />
      </Link>

      {/* <!-- Dropdown Start --> */}
      {dropdownOpen && (
        <div
          className={`absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark`}
        >
          <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
            <li>
              <Link
                href="/pages/admin/profile"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-[#00ABCD] lg:text-base"
              >
                <HiOutlineUserCircle className="text-2xl" />
                My Profile
              </Link>
            </li>
            <li>
              <Link
                href="/pages/admin/settings"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-[#00ABCD] lg:text-base"
              >
                <HiOutlineCog className="text-2xl" />
                Account Settings
              </Link>
            </li>
          </ul>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-[#00ABCD] lg:text-base"
          >
            <HiOutlineLogout className="text-2xl" />
            Log Out
          </button>
        </div>
      )}
      {/* <!-- Dropdown End --> */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </ClickOutside>
  );
};

export default DropdownUser;
