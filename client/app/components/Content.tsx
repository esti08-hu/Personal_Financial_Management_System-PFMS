"use client"

import React, { useState } from "react"
import { Zap, Wallet, Target, Compass, CheckCircle2, ArrowRight } from "lucide-react"

const stepsData = [
  {
    id: 1,
    stepNumber: '01',
    title: 'Create an account',
    description: 'Enter your basic information and set up your profile.',
    iconName: 'zap',
    details: 'Quick 60-second onboarding. Connect accounts via encrypted read-only bank feeds or manage manually.'
  },
  {
    id: 2,
    stepNumber: '02',
    title: 'Create your budget',
    description: 'Utilize our budgeting tools to create a realistic budget.',
    iconName: 'wallet',
    details: 'Categorize living costs, leisure, subscriptions, and auto-detect recurring utility expenses.'
  },
  {
    id: 3,
    stepNumber: '03',
    title: 'Set financial goals',
    description: 'Define your short- and long-term financial goals.',
    iconName: 'target',
    details: 'Configure milestones like Emergency Funds, Vacation savings, or Home Down payments with real-time tracking.'
  },
  {
    id: 4,
    stepNumber: '04',
    title: 'Explore our features',
    description: 'Leverage our tools for budgeting, investments and debt.',
    iconName: 'compass',
    details: 'Unlock predictive cash-flow forecasting, debt payoff calculators, and wealth accumulation scenarios.'
  }
]

const getStepIcon = (iconName: string) => {
  switch (iconName) {
    case 'zap':
      return <Zap className="w-5 h-5 text-sky-300" />
    case 'wallet':
      return <Wallet className="w-5 h-5 text-sky-300" />
    case 'target':
      return <Target className="w-5 h-5 text-sky-300" />
    case 'compass':
      return <Compass className="w-5 h-5 text-sky-300" />
    default:
      return <Zap className="w-5 h-5 text-sky-300" />
  }
}

const Content = () => {
  const [activeStep, setActiveStep] = useState(1)

  return (
    <section id="process-section" className="relative w-full px-4 sm:px-6 lg:px-12 py-20 overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-sky-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto text-center">
        {/* Section Subtitle */}
        <p className="text-xs sm:text-sm font-semibold tracking-widest text-sky-600 dark:text-sky-400/90 uppercase mb-2">
          -- OUR WORKING PROCESS --
        </p>

        {/* Section Heading */}
        <div className="inline-block relative mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            How to get started
          </h2>
          <div className="w-28 sm:w-36 h-1 mx-auto mt-2 bg-gradient-to-r from-transparent via-sky-400 to-transparent rounded-full shadow-[0_0_12px_#38bdf8]" />
        </div>

        {/* 4 Steps Grid & Flow Line */}
        <div className="relative">
          {/* Connecting horizontal bar (desktop) */}
          <div className="hidden lg:block absolute top-[42px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-sky-400/30 via-sky-300/60 to-sky-400/30 shadow-[0_0_10px_rgba(125,211,252,0.4)] -z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {stepsData.map((step) => {
              const isSelected = activeStep === step.id
              return (
                <div
                  key={step.id}
                  id={`process-step-${step.id}`}
                  onClick={() => setActiveStep(step.id)}
                  className={`group relative flex flex-col items-center text-center cursor-pointer transition-all duration-300 p-4 rounded-2xl ${
                    isSelected
                      ? 'bg-sky-500/10 dark:bg-sky-950/25 border border-sky-400/35 shadow-[0_0_25px_rgba(125,211,252,0.15)]'
                      : 'hover:bg-sky-50/60 dark:hover:bg-slate-900/30'
                  }`}
                >
                  {/* Glowing Step Orb */}
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 rounded-full blur-md transition-opacity duration-300 ${
                      isSelected ? 'bg-sky-400/40 opacity-100' : 'bg-sky-400/20 opacity-40 group-hover:opacity-80'
                    }`} />

                    <div className={`relative w-[84px] h-[84px] rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-300 ${
                      isSelected
                        ? 'bg-white dark:bg-sky-950/70 border-sky-400 dark:border-sky-300 shadow-[0_0_24px_rgba(125,211,252,0.5)] scale-105'
                        : 'bg-white/90 dark:bg-[#0f172a]/80 border-sky-400/30 group-hover:border-sky-300/70 group-hover:shadow-[0_0_18px_rgba(125,211,252,0.3)]'
                    }`}>
                      <div className="p-3 rounded-full bg-sky-500/15 border border-sky-400/20">
                        {getStepIcon(step.iconName)}
                      </div>

                      {/* Number Badge */}
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-[11px] font-bold text-sky-950 bg-gradient-to-r from-sky-200 to-sky-400 border border-sky-100 shadow-[0_0_10px_rgba(125,211,252,0.6)]">
                        {step.stepNumber}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-200 transition-colors">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-[240px]">
                    {step.description}
                  </p>

                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Step Expanded Info Box */}
        <div className="mt-12 max-w-2xl mx-auto p-5 rounded-2xl glass-surface border border-sky-400/20 text-left flex items-start gap-4 shadow-lg backdrop-blur-xl">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-300 shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="text-xs font-mono tracking-wider uppercase text-sky-600 dark:text-sky-400 mb-1 font-semibold">
              Step {stepsData[activeStep - 1].stepNumber} Walkthrough
            </div>
            <div className="text-sm text-slate-900 dark:text-slate-200 font-medium mb-1">
              {stepsData[activeStep - 1].title}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {stepsData[activeStep - 1].details}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Content
