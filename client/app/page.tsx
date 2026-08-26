"use client"

import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Services from "./components/Services";
import Testimonial from "./components/Testimonial";
import Footer from "./components/Footer";
import Content from "./components/Content";
import { GlacierThemeProvider } from "./context/ThemeContext";

export default function Home() {
  return (
    <GlacierThemeProvider>
      <LandingPage />
    </GlacierThemeProvider>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f0f6fc] dark:bg-[#0a0e1a] text-slate-800 dark:text-slate-100 relative overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-900 dark:selection:text-sky-200 transition-colors duration-300">
      {/* Background Decorative Ethereal Gradients & Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
        {/* Top-Right Glow */}
        <div className="absolute -top-[10%] -right-[10%] w-[650px] h-[650px] rounded-full bg-sky-400/20 dark:bg-sky-500/10 blur-[150px]" />
        {/* Mid-Left Glow */}
        <div className="absolute top-[35%] -left-[10%] w-[550px] h-[550px] rounded-full bg-indigo-400/15 dark:bg-indigo-600/10 blur-[160px]" />
        {/* Bottom-Right Glow */}
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] rounded-full bg-sky-300/20 dark:bg-sky-400/10 blur-[150px]" />
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(56, 189, 248, 0.5) 1px, transparent 1px)`,
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      {/* Main App Navigation Bar */}
      <Navbar />

      {/* Primary Landing & Experience Content */}
      <main className="flex flex-col items-center w-full">
        <Hero />
        <Content />
        <Services />
        <Testimonial />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
