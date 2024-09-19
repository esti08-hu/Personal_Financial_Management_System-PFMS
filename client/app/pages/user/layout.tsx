"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from "@/app/components/Footer";
import UserNavbar from "@/app/components/user components/UserNavbar";
import Head from 'next/head';

interface LayoutProps {
  pageTitle: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, pageTitle }) => {
  return (
    <>
      {/* Set the page title dynamically */}
      <Head>
        <title>{pageTitle} | My App</title>  {/* You can customize the suffix "My App" */}
      </Head>

      <div className="min-h-screen bg-gray-2 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <UserNavbar />
        
        {/* Animated Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center items-center h-40 font-black text-gray-800 dark:text-gray-100"
        >
                
        </motion.div>

        {/* Page Content */}
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={pageTitle}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-4 py-"
            >
              <div className="mx-auto">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Layout;
