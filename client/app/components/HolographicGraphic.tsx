"use client"

import { motion } from "framer-motion"
import { TrendingUp, Calendar, Shield, PiggyBank } from "lucide-react"
import Image from "next/image"

const HolographicGraphic = () => {
  return (
    <div className="relative w-[300px] sm:w-[380px] h-[340px] sm:h-[400px] flex items-center justify-center">
      {/* Atmospheric Background Glow */}
      <div className="absolute inset-0 glow-orb-primary rounded-full blur-2xl scale-110 animate-pulse-glow" />

      {/* Floating Savings Badge (Top Left) */}
      <motion.div
        initial={{ y: -6, rotate: -1 }}
        animate={{ y: [-6, 6, -6], rotate: [-1, 2, -1] }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: 0.3 }}
        className="absolute top-4 left-4 sm:left-6 z-20"
      >
        <div className="p-3 rounded-xl glass-surface border border-sky-400/30 shadow-[0_0_20px_rgba(125,211,252,0.25)] backdrop-blur-lg flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
            <PiggyBank className="w-4 h-4" />
          </div>
          <div className="text-left pr-1">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Total Savings</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
              +$480/mo <TrendingUp className="w-3 h-3 text-emerald-400" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Budget Tracker (Bottom Right) */}
      <motion.div
        initial={{ y: 6, rotate: 1 }}
        animate={{ y: [6, -6, 6], rotate: [1, -2, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: 0.8 }}
        className="absolute bottom-6 right-4 sm:right-8 z-20"
      >
        <div className="p-3 rounded-xl glass-surface border border-sky-400/30 shadow-[0_0_20px_rgba(125,211,252,0.25)] backdrop-blur-lg flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-300">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-left pr-1">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Monthly Budget</div>
            <div className="text-xs font-semibold text-sky-600 dark:text-sky-200">On Track: 92%</div>
          </div>
        </div>
      </motion.div>

      {/* Security Badge (Bottom Left) */}
      <motion.div
        initial={{ y: -4 }}
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4.8, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: 1.2 }}
        className="absolute bottom-14 left-4 z-20 hidden sm:block"
      >
        <div className="px-3 py-1.5 rounded-full glass-surface border border-sky-400/25 flex items-center gap-2 shadow-[0_0_15px_rgba(125,211,252,0.2)]">
          <Shield className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">Bank-Grade 256-Bit</span>
        </div>
      </motion.div>

      {/* Main Holographic Figure Image */}
      <motion.div
        initial={{ y: -5 }}
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        className="relative z-10 w-[280px] sm:w-[380px] h-auto flex items-center justify-center filter drop-shadow-[0_0_22px_rgba(125,211,252,0.6)]"
      >
        <Image 
          src="/images/hero/financial_hero.jpg" 
          alt="Financial Dashboard Hologram" 
          width={600} 
          height={337} 
          className="rounded-2xl border border-sky-400/30 object-cover"
        />
      </motion.div>
    </div>
  )
}

export default HolographicGraphic
