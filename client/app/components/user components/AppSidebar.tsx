"use client";

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { LayoutDashboard, ArrowLeftRight, PieChart, Landmark, FileText, Settings, LogOut } from "lucide-react"
import { ThemeToggle } from "@/app/components/ThemeToggle"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const navigationData = [
  {
    title: "Dashboard",
    href: "/pages/user",
    icon: LayoutDashboard,
  },
  {
    title: "Transaction",
    icon: ArrowLeftRight,
    isActivePath: "/pages/user/transaction",
    items: [
      {
        title: "Transaction List",
        href: "/pages/user/transaction/transactionList",
      },
      {
        title: "Add Transaction",
        href: "/pages/user/transaction/addTransaction",
      },
    ],
  },
  {
    title: "Budget",
    icon: PieChart,
    isActivePath: "/pages/user/budget",
    items: [
      {
        title: "Manage Budget",
        href: "/pages/user/budget/manageBudget",
      },
      {
        title: "Set Budget",
        href: "/pages/user/budget/setBudget",
      },
    ],
  },
  {
    title: "Account",
    icon: Landmark,
    isActivePath: "/pages/user/account",
    items: [
      {
        title: "Manage Account",
        href: "/pages/user/account/manageAccount",
      },
      {
        title: "Add Account",
        href: "/pages/user/account/addAccount",
      },
    ],
  },
  {
    title: "Report",
    href: "/pages/user/report",
    icon: FileText,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="glass-surface-elevated border-r border-sky-400/20 backdrop-blur-3xl" {...props}>
      <SidebarHeader className="border-b border-sky-400/10 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-sky-500/10 transition-colors mt-2">
              <Link href="/pages/user">
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 p-[1px] shadow-[0_0_15px_rgba(125,211,252,0.4)] group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-slate-100 dark:bg-[#0d1322] rounded-[11px] flex items-center justify-center">
                    <div className="w-4 h-4 rounded-[4px] bg-gradient-to-tr from-sky-400 via-sky-300 to-indigo-300 rotate-45 group-hover:rotate-90 transition-transform duration-500" />
                  </div>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-bold text-slate-800 dark:text-slate-100">MoneyMaster</span>
                  <span className="truncate text-xs text-sky-600 dark:text-sky-400">Wealth Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {navigationData.map((item) => {
              const isActive = Boolean(item.href ? pathname === item.href : (item.isActivePath && pathname.includes(item.isActivePath)));
              
              return (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <>
                      <SidebarMenuButton tooltip={item.title} isActive={isActive} className="hover:bg-sky-500/10 data-[active=true]:bg-sky-500/15 data-[active=true]:text-sky-600 dark:data-[active=true]:text-sky-400 transition-colors rounded-lg">
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={pathname === subItem.href} className="hover:bg-sky-500/10 data-[active=true]:bg-sky-500/15 data-[active=true]:text-sky-600 dark:data-[active=true]:text-sky-400 transition-colors rounded-lg">
                              <Link href={subItem.href}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </>
                  ) : (
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive} className="hover:bg-sky-500/10 data-[active=true]:bg-sky-500/15 data-[active=true]:text-sky-600 dark:data-[active=true]:text-sky-400 transition-colors rounded-lg">
                      <Link href={item.href!}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sky-400/10 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-data-[collapsible=icon]:hidden">
                Theme
              </span>
              <ThemeToggle />
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Sign Out"
              className="hover:bg-red-500/10 hover:text-red-500 hover:border-red-400/30 transition-all text-slate-700 dark:text-slate-300 rounded-lg"
            >
              <Link href="/pages/login">
                <LogOut className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
