"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ArrowRight, Sparkles, Sun, Moon } from "lucide-react"
import { useGlacierTheme } from "../context/ThemeContext"

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useGlacierTheme()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 lg:px-12 transition-all duration-300 ${
        scrolled 
          ? "bg-[#f0f6fc]/80 dark:bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-sky-400/20 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-black/40" 
          : "bg-transparent py-5"
      }`}
    >
      <nav
        id="main-navigation"
        className="max-w-7xl mx-auto flex items-center justify-between"
      >
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          id="brand-logo-btn"
        >
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 p-[1px] shadow-[0_0_15px_rgba(125,211,252,0.4)] group-hover:shadow-[0_0_22px_rgba(125,211,252,0.65)] transition-all">
            <div className="w-full h-full bg-sky-950 dark:bg-[#0d1322] rounded-[7px] flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-sm bg-gradient-to-tr from-sky-400 via-sky-300 to-indigo-300 rotate-45 group-hover:rotate-90 transition-transform duration-500" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              MoneyMaster
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            id="nav-link-home"
            onClick={() => scrollToSection('hero-section')}
            className="hover:text-sky-600 dark:hover:text-sky-300 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
          >
            Home
          </button>
          <button
            id="nav-link-process"
            onClick={() => scrollToSection('process-section')}
            className="hover:text-sky-600 dark:hover:text-sky-300 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
          >
            Our Process
          </button>
          <button
            id="nav-link-services"
            onClick={() => scrollToSection('services-section')}
            className="hover:text-sky-600 dark:hover:text-sky-300 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
          >
            Services
          </button>
          <button
            id="nav-link-testimonials"
            onClick={() => scrollToSection('testimonials-section')}
            className="hover:text-sky-600 dark:hover:text-sky-300 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
          >
            Testimonials
          </button>
        </div>

        {/* Action Buttons & Theme Toggle */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-xl glass-surface border border-sky-400/20 text-slate-700 dark:text-sky-300 hover:text-sky-600 dark:hover:text-white hover:border-sky-400/50 shadow-sm transition-all cursor-pointer flex items-center justify-center"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300 filter drop-shadow-[0_0_6px_rgba(252,211,77,0.7)]" />
            ) : (
              <Moon className="w-4 h-4 text-sky-600" />
            )}
          </button>

          <Link
            href="/pages/login"
            id="nav-signin-btn"
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Log In
          </Link>
          <Link
            href="/pages/signup"
            id="nav-signup-btn"
            className="group flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-sky-950 bg-gradient-to-r from-sky-300 via-sky-200 to-sky-400 hover:from-sky-200 hover:to-sky-300 shadow-[0_0_20px_rgba(125,211,252,0.45)] hover:shadow-[0_0_28px_rgba(125,211,252,0.7)] transition-all transform active:scale-95 cursor-pointer"
          >
            Sign Up
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-sky-950" />
          </Link>
        </div>

        {/* Mobile menu trigger & Mobile Theme Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            id="mobile-theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-lg glass-surface text-slate-700 dark:text-sky-300"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-sky-600" />}
          </button>
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 p-4 rounded-2xl glass-surface-elevated border border-sky-400/20 flex flex-col gap-3 text-sm animate-fade-in shadow-xl">
          <button
            onClick={() => scrollToSection('hero-section')}
            className="text-left py-2 px-3 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('process-section')}
            className="text-left py-2 px-3 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-300"
          >
            Our Process
          </button>
          <button
            onClick={() => scrollToSection('services-section')}
            className="text-left py-2 px-3 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
          >
            Services
          </button>
          <button
            onClick={() => scrollToSection('testimonials-section')}
            className="text-left py-2 px-3 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-300"
          >
            Testimonials
          </button>
          <div className="pt-2 border-t border-slate-300 dark:border-slate-700/50 flex gap-2">
            <Link
              href="/pages/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-sky-950 bg-sky-300 shadow-[0_0_15px_rgba(125,211,252,0.4)] text-center"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
