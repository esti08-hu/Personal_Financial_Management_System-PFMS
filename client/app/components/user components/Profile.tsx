"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import apiClient from "@/app/lib/axiosConfig"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { User } from "@/app/types/user"
import Loader from "../../common/Loader"
import Breadcrumb from "../../common/Breadcrumbs/Breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, UserIcon } from "lucide-react"

const Profile = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get("/auth/user-profile")
        setUser(response.data)
      } catch (error) {
        toast.error("An error occurred while fetching user data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 w-full">
        <Loader />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 animate-fade-in relative z-10 space-y-8">
      <Breadcrumb pageName="Profile" />

      <Card className="glass-surface-elevated rounded-3xl border border-sky-400/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),0_0_45px_rgba(125,211,252,0.12)] backdrop-blur-2xl overflow-hidden group">
        <div className="relative h-32 md:h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/30 to-indigo-500/30 group-hover:scale-105 transition-transform duration-700 z-10" />
          <Image
            src={"/images/cover/cover-01.png"}
            alt="profile cover"
            className="h-full w-full object-cover object-center relative z-0"
            width={970}
            height={260}
          />
        </div>

        <CardContent className="relative px-6 pb-8 z-20">
          <div className="flex flex-col items-center -mt-16 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-sky-400/30 rounded-full blur-xl animate-pulse-slow"></div>
              <Avatar className="h-32 w-32 border-4 border-[#0a0e1a] shadow-[0_0_20px_rgba(14,165,233,0.3)] relative z-10">
                <AvatarImage src={user?.profilePicture || "/images/user/user.png"} alt={user?.name || "User"} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-bold">{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center mt-5 space-y-1">
              <h1 className="text-3xl font-display font-bold text-slate-800 dark:text-white tracking-tight drop-shadow-sm">{user?.name}</h1>
              <p className="text-sky-600 dark:text-sky-400 font-semibold tracking-wide uppercase text-sm">{user?.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-surface-elevated rounded-3xl border border-sky-400/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),0_0_45px_rgba(125,211,252,0.12)] backdrop-blur-2xl overflow-hidden mt-8">
        <CardHeader className="border-b border-sky-400/10 bg-slate-50/50 dark:bg-[#0a0e1a]/50 py-6 px-8">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-white">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.15)]">
              <UserIcon className="h-5 w-5 text-sky-500" />
            </div>
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-8">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10 hover:bg-sky-500/10 transition-colors">
            <div className="h-10 w-10 rounded-full bg-sky-500/20 flex items-center justify-center">
              <Mail className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-colors">
            <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Phone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Phone Number</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{user?.phone || "Not provided"}</p>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  )
}

export default Profile
