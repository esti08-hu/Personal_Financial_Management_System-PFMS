"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Link as ScrollLink } from "react-scroll"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "HOME", to: "hero" },
    { name: "PROCESS", to: "working-process" },
    { name: "SERVICES", to: "services" },
    { name: "TESTIMONIALS", to: "testimonials" },
  ]

  const isLanding = pathname === "/"
  const navStyle: React.CSSProperties = isLanding
    ? scrolled
      ? { background: "hsl(var(--color-primary) / 0.8)" }
      : { background: "hsl(var(--color-primary) / 0.2)" }
    : scrolled
    ? { background: "hsl(var(--color-primary) / 0.95)" }
    : { background: "hsl(var(--color-primary) / 0.95)" };

  return (
    <motion.nav
      style={navStyle}
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        isLanding
          ? scrolled
            ? "backdrop-blur border-b border-primary/30 navbar-bg-strong"
            : "backdrop-blur-sm navbar-bg-opaque"
          : scrolled
          ? "backdrop-blur-sm border-b border-gray-200 navbar-bg"
          : "backdrop-blur-sm navbar-bg"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              width={110}
              height={32}
              src="/images/logo/moneymaster.png"
              alt="MoneyMaster Logo"
              className="w-auto h-8 md:h-10"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <ScrollLink
                key={item.name}
                to={item.to}
                smooth={true}
                duration={500}
                offset={-80}
                spy={true}
                activeClass="active-nav"
                className={cn(
                  "group relative inline-flex items-center text-sm font-medium transition-transform duration-200",
                  "hover:scale-105",
                  "cursor-pointer",
                  scrolled ? "text-white" : "text-slate-700"
                )}
              >
                <span className="relative z-10">{item.name}</span>
                <span
                  className={cn(
                    "absolute left-0 -bottom-1 h-0.5 bg-current transition-all duration-200 nav-underline",
                    "group-hover:w-full",
                    "w-0"
                  )}
                />
              </ScrollLink>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="ghost"
              asChild
              className={cn(
                "rounded-full px-4 py-2 text-sm transition transform hover:scale-105 hover:bg-white/10 border",
                scrolled ? "text-white border-white" : "text-slate-700 border-slate-700"
              )}
            >
              <Link href="/pages/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm shadow-md hover:shadow-lg transform transition hover:scale-105"
            >
              <Link href="/pages/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
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
            className="md:hidden !bg-primary/95 backdrop-blur-sm border-b border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <ScrollLink
                  key={item.name}
                  to={item.to}
                  smooth={true}
                  duration={500}
                  offset={-80}
                  spy={true}
                  activeClass="active-nav"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-2 text-base font-medium transition-transform duration-200 rounded-md",
                    "hover:scale-105",
                    "cursor-pointer",
                    scrolled ? "text-white" : "text-gray-900 hover:text-primary"
                  )}
                >
                  <span className="relative">{item.name}</span>
                </ScrollLink>
              ))}
              <div className="pt-4 space-y-2">
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start border px-3 py-2 rounded-md", scrolled ? "text-white border-white" : "text-slate-700 border-slate-700")}
                  asChild
                >
                  <Link href="/pages/login">Sign In</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/pages/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
