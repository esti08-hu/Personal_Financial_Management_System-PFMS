import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserCircle, Settings, LogOut, ChevronDown } from "lucide-react";
import apiClient from "@/app/lib/axiosConfig";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Admin } from "@/app/types/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const DropdownUser = () => {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await apiClient.get("/auth/admin-profile");
        setAdmin(response.data);
      } catch (error) {
        toast.error("An error occurred while fetching user data.");
      }
    };
    fetchAdminData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await apiClient.post("/auth/logout");
      if (response.status === 200) {
        toast.success("Logout successful!");
        setTimeout(() => router.push("/pages/admin/auth/signin"), 1500);
      }
    } catch (err) {
      toast.error("An error occurred during logout.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-4 h-14 hover:bg-transparent">
          <div className="hidden text-right lg:block">
            <span className="block text-sm font-medium text-foreground">
              {admin?.name || "Admin User"}
            </span>
            <span className="block text-xs text-muted-foreground">{admin?.role || "Admin"}</span>
          </div>

          <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-background">
            <Image
              width={40}
              height={40}
              src={admin?.profilePicture || "/images/user/user.png"}
              alt="User"
              className="h-full w-full object-cover"
            />
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/pages/admin/profile" className="flex cursor-pointer items-center">
            <UserCircle className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/pages/admin/settings" className="flex cursor-pointer items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownUser;
