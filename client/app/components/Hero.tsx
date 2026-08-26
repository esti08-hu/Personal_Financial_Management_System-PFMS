"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react"
import HolographicGraphic from "./HolographicGraphic"

const Hero = () => {
  return (
    <section className="relative w-full px-4 sm:px-6 lg:px-12 pt-6 pb-16 overflow-hidden">
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[500px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Main Glassmorphic Hero Container */}
      <div
        id="hero-glass-card"
        className="relative max-w-7xl mx-auto rounded-3xl glass-surface-elevated border border-sky-400/20 p-8 sm:p-12 lg:p-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_45px_rgba(125,211,252,0.12)] overflow-hidden backdrop-blur-2xl"
      >
        {/* Interior Glow */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/25 mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
              <span className="text-xs font-medium tracking-wide text-sky-700 dark:text-sky-200">
                PFMS Financial Engine
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] mb-5">
              Plan your future{' '}
              <br className="hidden sm:inline" />
              with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 dark:from-sky-300 dark:via-sky-200 dark:to-sky-400 dark:drop-shadow-[0_0_25px_rgba(125,211,252,0.5)]">
                confidence.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xl mb-8">
              Create and manage budgets effortlessly.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/pages/signup"
                id="hero-create-account-btn"
                className="group relative inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm sm:text-base font-semibold text-sky-950 bg-gradient-to-r from-sky-300 via-sky-200 to-sky-300 hover:from-sky-200 hover:to-white shadow-[0_0_30px_rgba(125,211,252,0.5)] hover:shadow-[0_0_40px_rgba(125,211,252,0.8)] transition-all duration-300 transform active:scale-95 cursor-pointer"
              >
                <span>Create account now</span>
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                id="hero-try-interactive-btn"
                onClick={() => {
                  const el = document.getElementById('services-section')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full text-sm font-medium glass-pill-secondary cursor-pointer"
              >
                <Zap className="mr-2 w-4 h-4 text-sky-500 dark:text-sky-400" />
                <span>Explore Features</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="mt-10 pt-6 border-t border-sky-400/10 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
                <span>Zero hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
                <span>Automated sync</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
                <span>Intelligent forecasting</span>
              </div>
            </div>
          </div>

          {/* Right Column: Holographic Visual */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <HolographicGraphic />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
