"use client"

import type React from "react"

import Footer from "@/app/components/Footer"
import UserNavbar from "@/app/components/user components/UserNavbar"
import { ToastContainer } from "react-toastify"
import { useState } from "react"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import ChatWindow from "@/app/components/ai/ChatWindow"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="relative min-h-screen bg-gray-2 flex flex-col  from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <UserNavbar />
      <div className="flex flex-col justify-center items-center  font-black text-gray-800 dark:text-gray-100"></div>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto">{children}</div>
        </div>
      </main>

      <Footer />

      {/* AI Chat Button */}
      <Button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
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

      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} />
    </div>
  )
}

export default Layout
