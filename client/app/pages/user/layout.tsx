"use client"

import type React from "react"

import Footer from "@/app/components/Footer"
import UserNavbar from "@/app/components/user components/UserNavbar"
import { ToastContainer } from "react-toastify"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
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

      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} />
    </div>
  )
}

export default Layout
