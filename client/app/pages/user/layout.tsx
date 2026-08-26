"use client"

import type React from "react"

import { useState } from "react"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import ChatWindow from "@/app/components/ai/ChatWindow"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/app/components/user components/AppSidebar"
import DropdownUser from "@/app/components/user components/DropdownUser"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-[#f0f6fc] dark:bg-[#0a0e1a] text-slate-800 dark:text-slate-100 flex transition-colors duration-300 relative overflow-x-hidden">
        {/* Background Decorative Ethereal Gradients & Orbs */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div suppressHydrationWarning className="absolute -top-[10%] -right-[10%] w-[650px] h-[650px] rounded-full bg-sky-400/20 dark:bg-sky-500/10 blur-[150px]" />
          <div suppressHydrationWarning className="absolute top-[35%] -left-[10%] w-[550px] h-[550px] rounded-full bg-indigo-400/15 dark:bg-indigo-600/10 blur-[160px]" />
          <div suppressHydrationWarning className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] rounded-full bg-sky-300/20 dark:bg-sky-400/10 blur-[150px]" />
          <div 
            suppressHydrationWarning
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `radial-gradient(rgba(56, 189, 248, 0.5) 1px, transparent 1px)`,
              backgroundSize: '36px 36px'
            }}
          />
        </div>

        <AppSidebar />
        <SidebarInset className="bg-transparent flex-1 min-w-0 z-10 relative">
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-sky-400/20 glass-surface px-4">
            <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div className="hidden md:block">
              {/* Optional Breadcrumbs could go here */}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DropdownUser />
          </div>
        </header>

        <main className="flex-1 relative z-10 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>

        {/* AI Chat Button */}
        <Button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-[0_10px_30px_rgba(14,165,233,0.3)] bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 border-none transition-all duration-300 z-40 text-white hover:scale-105"
          size="lg"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="sr-only">Open AI Assistant</span>
        </Button>

        {/* AI Chat Window */}
        <ChatWindow
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default Layout
