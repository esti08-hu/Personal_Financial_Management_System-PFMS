"use client"

import React from "react"
import { Sparkles, ArrowUpRight } from "lucide-react"

const servicesData = [
  {
    id: 'budget',
    title: 'Budgeting and Expense Tracking',
    description: 'The ability to create a new household budget, categorize expenses, and track spending patterns over time.',
    iconType: 'budget',
    badge: 'Interactive Tool',
    actionText: 'Try Budget Planner',
  },
  {
    id: 'savings',
    title: 'Income and Savings Management',
    description: 'Tracking and recording of income, as salaries, investments, and other revenue investments.',
    iconType: 'savings',
    badge: 'Live Simulator',
    actionText: 'Explore Savings',
  },
  {
    id: 'goals',
    title: 'Financial Goal Setting',
    description: 'Monitoring progress towards these goals and adjusting plans as needed to stay on track.',
    iconType: 'goals',
    badge: 'Smart Analytics',
    actionText: 'View Goal Tracker',
  },
]

const Services = () => {
  return (
    <section id="services-section" className="relative w-full px-4 sm:px-6 lg:px-12 py-20 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-sky-600 dark:text-sky-400/90 uppercase mb-2">
            -- OUR SERVICES --
          </p>
          <div className="inline-block relative">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Our Services
            </h2>
            <div className="w-24 sm:w-32 h-1 mx-auto mt-2 bg-gradient-to-r from-transparent via-sky-400 to-transparent rounded-full shadow-[0_0_12px_#38bdf8]" />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicesData.map((service) => (
            <div
              key={service.id}
              id={`service-card-${service.id}`}
              className="group relative flex flex-col items-center text-center p-8 rounded-3xl glass-surface glass-surface-hover border border-sky-400/15 cursor-pointer overflow-hidden"
            >
              {/* Background hover glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-sky-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Service Icon SVG */}
              <div className="relative mb-8 w-28 h-28 flex items-center justify-center">
                {/* Back glow */}
                <div className="absolute inset-0 rounded-2xl bg-sky-400/25 blur-xl group-hover:bg-sky-400/40 transition-all" />

                {service.iconType === 'budget' && (
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(125,211,252,0.8)]">
                      <defs>
                        <linearGradient id="walletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#bae6fd" />
                          <stop offset="60%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#0284c7" />
                        </linearGradient>
                      </defs>
                      <rect x="15" y="32" width="70" height="48" rx="10" fill="url(#walletGrad)" fillOpacity="0.85" stroke="#bae6fd" strokeWidth="2" />
                      <path d="M50 48 Q75 48 85 54 L85 64 Q75 70 50 70 Z" fill="#0c4a6e" stroke="#bae6fd" strokeWidth="1.5" />
                      <circle cx="70" cy="59" r="4" fill="#e0f2fe" filter="drop-shadow(0 0 4px #7dd3fc)" />
                      <g transform="translate(48, 12)">
                        <circle cx="20" cy="20" r="18" fill="#0f172a" fillOpacity="0.8" stroke="#bae6fd" strokeWidth="1.5" />
                        <path d="M20 20 L20 2 A18 18 0 0 1 38 20 Z" fill="#38bdf8" stroke="#bae6fd" strokeWidth="1" />
                        <path d="M20 20 L38 20 A18 18 0 0 1 20 38 Z" fill="#7dd3fc" />
                        <path d="M20 20 L20 38 A18 18 0 1 1 20 2 Z" fill="#0284c7" />
                      </g>
                    </svg>
                  </div>
                )}

                {service.iconType === 'savings' && (
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(125,211,252,0.8)]">
                      <defs>
                        <linearGradient id="cashGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#e0f2fe" />
                          <stop offset="100%" stopColor="#38bdf8" />
                        </linearGradient>
                      </defs>
                      <g transform="rotate(-10 50 50)">
                        <rect x="18" y="32" width="64" height="36" rx="6" fill="#0369a1" fillOpacity="0.7" stroke="#7dd3fc" strokeWidth="1.5" />
                      </g>
                      <g transform="rotate(8 50 50)">
                        <rect x="18" y="32" width="64" height="36" rx="6" fill="#0284c7" fillOpacity="0.8" stroke="#bae6fd" strokeWidth="1.5" />
                      </g>
                      <rect x="18" y="34" width="64" height="36" rx="6" fill="url(#cashGrad2)" fillOpacity="0.9" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="50" cy="52" r="9" fill="#0369a1" stroke="#e0f2fe" strokeWidth="1.5" />
                      <text x="46.5" y="56" fill="#ffffff" fontSize="12" fontWeight="bold">$</text>
                      <circle cx="78" cy="24" r="8" fill="#bae6fd" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="22" cy="72" r="7" fill="#7dd3fc" stroke="#ffffff" strokeWidth="1.5" />
                    </svg>
                  </div>
                )}

                {service.iconType === 'goals' && (
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(125,211,252,0.8)]">
                      <defs>
                        <linearGradient id="chartGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                          <stop offset="0%" stopColor="#0369a1" />
                          <stop offset="100%" stopColor="#38bdf8" />
                        </linearGradient>
                      </defs>
                      <rect x="18" y="55" width="10" height="25" rx="3" fill="#0284c7" />
                      <rect x="33" y="42" width="10" height="38" rx="3" fill="#0369a1" />
                      <rect x="48" y="28" width="10" height="52" rx="3" fill="url(#chartGrad)" />
                      <rect x="63" y="16" width="10" height="64" rx="3" fill="#38bdf8" />
                      <path d="M22 52 L37 40 L52 25 L68 12" stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" />
                      <g transform="translate(42, 22)">
                        <circle cx="20" cy="20" r="18" fill="#0f172a" fillOpacity="0.4" stroke="#bae6fd" strokeWidth="3" />
                        <line x1="33" y1="33" x2="48" y2="48" stroke="#bae6fd" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="20" cy="20" r="5" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
                        <line x1="20" y1="11" x2="20" y2="29" stroke="#38bdf8" strokeWidth="1" />
                        <line x1="11" y1="20" x2="29" y2="20" stroke="#38bdf8" strokeWidth="1" />
                      </g>
                    </svg>
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-sky-600 dark:group-hover:text-sky-200 transition-colors relative z-10">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-8 flex-grow relative z-10">
                {service.description}
              </p>

              {/* Card Footer */}
              <div className="w-full pt-4 border-t border-sky-400/15 dark:border-sky-400/10 flex items-center justify-between text-xs relative z-10">
                <span className="text-sky-700 dark:text-sky-300/80 font-mono flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3 text-sky-500 dark:text-sky-400" />
                  {service.badge}
                </span>
                <span className="font-semibold text-sky-600 dark:text-sky-200 group-hover:text-sky-800 dark:group-hover:text-white flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
                  {service.actionText}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
