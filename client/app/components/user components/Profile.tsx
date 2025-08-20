"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import apiClient from "@/app/lib/axiosConfig"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
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
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumb pageName="Profile" />

      <Card className="overflow-hidden">
        <div className="relative h-32 md:h-48 bg-gradient-to-r from-primary/20 to-primary/10">
          <Image
            src={"/images/cover/cover-01.png"}
            alt="profile cover"
            className="h-full w-full object-cover object-center"
            width={970}
            height={260}
          />
        </div>

        <CardContent className="relative px-6 pb-6">
          <div className="flex flex-col items-center -mt-16 mb-6">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={user?.profilePicture || "/images/user/user.png"} alt={user?.name || "User"} />
              <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>

            <div className="text-center mt-4">
              <h1 className="text-2xl font-display font-bold text-foreground">{user?.name}</h1>
              <p className="text-muted-foreground font-medium">{user?.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-semibold">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="font-semibold">{user?.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
  )
}

export default Profile
