import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserCircle, Settings, LogOut, ChevronDown } from "lucide-react";
import apiClient from "@/app/lib/axiosConfig";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { User } from "@/app/types/user";
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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get("/auth/user-profile");
        setUser(response.data);
      } catch (error) {
        toast.error("An error occurred while fetching user data.");
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await apiClient.post("/auth/logout");
      if (response.status === 200) {
        toast.success("Logout successful!");
        setTimeout(() => router.push("/pages/login"), 1500);
      }
    } catch (err) {
      toast.error("An error occurred during logout. Please try again.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-3 h-12 px-3 rounded-xl border border-sky-400/20 glass-surface hover:bg-sky-500/10 hover:border-sky-400/40 transition-all duration-200 cursor-pointer group">
          <div className="hidden text-right lg:block">
            <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              {user?.name || "User"}
            </span>
            <span className="block text-[11px] font-medium text-sky-600 dark:text-sky-400">{user?.role || "Member"}</span>
          </div>

          <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-sky-400/40 shadow-[0_0_10px_rgba(56,189,248,0.35)] bg-slate-100 dark:bg-[#0d1322] relative">
            <Image
              width={36}
              height={36}
              src={user?.profilePicture || "/images/user/user.png"}
              alt="User Profile"
              className="h-full w-full object-cover"
            />
          </div>
          <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 glass-surface-elevated bg-white/95 dark:bg-[#0d1322]/95 border border-sky-400/20 shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_30px_rgba(56,189,248,0.15)] backdrop-blur-2xl rounded-2xl p-2 text-slate-800 dark:text-slate-100 animate-in fade-in-80 zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
        <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-sky-400/10 my-1" />
        <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 text-sm font-medium focus:bg-sky-500/15 focus:text-sky-600 dark:focus:text-sky-400 transition-colors cursor-pointer">
          <Link href="/pages/user/profile" className="flex items-center gap-2.5">
            <UserCircle className="h-4 w-4 text-sky-500" />
            <span>My Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 text-sm font-medium focus:bg-sky-500/15 focus:text-sky-600 dark:focus:text-sky-400 transition-colors cursor-pointer">
          <Link href="/pages/user/settings" className="flex items-center gap-2.5">
            <Settings className="h-4 w-4 text-sky-500" />
            <span>Account Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-sky-400/10 my-1" />
        <DropdownMenuItem onClick={handleLogout} className="rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 focus:bg-red-500/10 focus:text-red-500 transition-colors cursor-pointer">
          <LogOut className="h-4 w-4 mr-1.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownUser;
