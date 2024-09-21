"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as ScrollLink } from "react-scroll";
import { HiX, HiOutlineMenu } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation items
  const navItems = [
    { name: "HOME", to: "hero" },
    { name: "PROCESS", to: "working-process" },
    { name: "SERVICES", to: "services" },
    { name: "TESTIMONIALS", to: "testimonials" },
  ];

  return (
    <motion.nav
    style={!scrolled ? { backgroundColor: "rgba(0, 172, 205, 0.50)"  } : {}}
    className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled ? "bg-cyan-500 shadow-lg text-white" : " !text-[#22577A]"
    }`}
  >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between w-full items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="#">
            <Image
              width={110}
              height={32}
              src="/images/logo/moneymaster.png"
              alt="Logo"
              className=" w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4 cursor-pointer">
              {navItems.map((item) => (
                <ScrollLink
                  key={item.name}
                  to={item.to}
                  smooth={true}
                  duration={500}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    scrolled
                      ? "text-white hover:!text-[#22577A] "
                      : "hover:!text-white !text-[#22577A]  hover:bg-opacity-20"
                  } transition-colors duration-300`}
                >
                  {item.name}
                </ScrollLink>
              ))}
            </div>
          </div>

          {/* Desktop Sign In / Sign Up */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/pages/login">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-md border border-stroke text-sm font-medium  text-cyan-400 to-cyan-600 bg-gray-2 hover:from-cyan-500 hover:to-cyan-700 transition-colors duration-300"
              >
                Sign In
              </motion.button>
            </Link>
            <Link href="/pages/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-cyan-400 to-cyan-600 text-white hover:from-cyan-500 hover:to-cyan-700 transition-colors duration-300"
              >
                Sign Up
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                scrolled ? "text-gray-800" : "text-white"
              } focus:outline-none focus:ring-2  focus:ring-inset focus:ring-white`}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <HiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <HiOutlineMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden max-w-fit border-br:rounded-sm ${
              scrolled ? "bg-white" : "bg-graydark"
            }`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 cursor-pointer">
              {navItems.map((item) => (
                <ScrollLink
                  key={item.name}
                  to={item.to}
                  smooth={true}
                  duration={500}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    scrolled
                      ? "text-graydark border border-white hover:border-gray"
                      : "text-white hover:bg-gray"
                  } transition-colors duration-300`}
                >
                  {item.name}
                </ScrollLink>
              ))}
              <div className="mt-4 space-y-2 flex flex-col gap-2">
                <Link href="/pages/login">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="max-w-fit px-12 py-2 rounded-md border border-stroke text-sm font-medium  text-cyan-400 to-cyan-600 bg-gray-2 hover:from-cyan-500 hover:to-cyan-700 transition-colors duration-300"
                    >
                    Sign In
                  </motion.button>
                </Link>
                <Link href="/pages/signup">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="max-w-fit px-12 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-cyan-400 to-cyan-600 text-white hover:from-cyan-500 hover:to-cyan-700 transition-colors duration-300"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
