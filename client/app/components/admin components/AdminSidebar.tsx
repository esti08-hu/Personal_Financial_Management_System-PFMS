"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  Users,
  Settings,
  User,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar"
import apiClient from "@/app/lib/axiosConfig"
import { toast } from "sonner"

const navItems = [
  {
    title: "Dashboard",
    url: "/pages/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Profile",
    url: "/pages/admin/profile",
    icon: User,
  },
  {
    title: "Users",
    url: "/pages/admin/users",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/pages/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { setOpenMobile } = useSidebar()

  const handleLogout = async () => {
    try {
      const response = await apiClient.post("/auth/logout")
      if (response.status === 200) {
        toast.success("Logout successful!")
        setTimeout(() => router.push("/pages/admin/auth/signin"), 1500)
      }
    } catch (err) {
      toast.error("An error occurred during logout.")
    }
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/pages/admin/dashboard" onClick={() => setOpenMobile(false)} className="flex items-center gap-2">
          <Image
            src="/images/logo/logo.png"
            width={120}
            height={32}
            alt="MoneyMaster Logo"
            className="h-8 w-auto"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      onClick={() => setOpenMobile(false)}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                handleLogout()
                setOpenMobile(false)
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
