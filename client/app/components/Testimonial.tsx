"use client"

import React, { useState } from "react"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const testimonials = [
  {
    id: '1',
    name: 'Michael Chen',
    role: 'Small Business Owner',
    rating: 5.0,
    quote: 'As a small business owner, I was struggling to keep track of all my business and personal finances. This personal financial system has been a lifesaver.',
    highlight: 'Reduced monthly expense tracking time by 75%'
  },
  {
    id: '2',
    name: 'Sarah Williams',
    role: 'Freelance Designer',
    rating: 5.0,
    quote: 'The budgeting tools are incredibly intuitive. I finally feel in control of my finances and can plan for the future with real confidence.',
    highlight: 'Reached 12-month emergency goal 3 months early'
  },
  {
    id: '3',
    name: 'David Kim',
    role: 'Independent Tech Consultant',
    rating: 5.0,
    quote: 'The milestone forecasting engine is unmatched. Having confidence in how each daily transaction impacts my 5-year outlook transformed my savings habits.',
    highlight: 'Increased annual savings rate from 14% to 32%'
  }
]

const Testimonial = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const nextTestimonial = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const current = testimonials[currentIndex]

  return (
    <section id="testimonials-section" className="relative w-full px-4 sm:px-6 lg:px-12 py-20 overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto text-center">
        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-semibold tracking-widest text-sky-600 dark:text-sky-400/90 uppercase mb-8">
          -- TESTIMONIALS --
        </p>

        {/* Outer Frosted Glass Container */}
        <div
          id="testimonial-carousel-container"
          className="relative rounded-3xl glass-surface-elevated border border-sky-400/20 p-6 sm:p-12 lg:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_35px_rgba(125,211,252,0.1)] backdrop-blur-2xl"
        >
          {/* Left Arrow */}
          <button
            id="testimonial-prev-btn"
            onClick={prevTestimonial}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-surface border border-sky-400/30 flex items-center justify-center text-sky-600 dark:text-sky-300 hover:text-sky-900 dark:hover:text-white hover:border-sky-300 hover:scale-110 shadow-[0_0_15px_rgba(125,211,252,0.25)] transition-all z-20 cursor-pointer"
            aria-label="Previous Testimonial"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Right Arrow */}
          <button
            id="testimonial-next-btn"
            onClick={nextTestimonial}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-surface border border-sky-400/30 flex items-center justify-center text-sky-600 dark:text-sky-300 hover:text-sky-900 dark:hover:text-white hover:border-sky-300 hover:scale-110 shadow-[0_0_15px_rgba(125,211,252,0.25)] transition-all z-20 cursor-pointer"
            aria-label="Next Testimonial"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Animated Testimonial Card */}
          <div className="max-w-2xl mx-auto px-6 sm:px-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: direction > 0 ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -30 : 30 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                {/* Header: Avatar, Name/Role, Quote Icon */}
                <div className="w-full flex items-center justify-between gap-4 pb-6 border-b border-sky-400/15 dark:border-sky-400/10">
                  {/* Avatar */}
                  <div className="flex items-center gap-3.5 sm:gap-4 text-left">
                    <div className="relative">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] bg-gradient-to-tr from-sky-400 via-sky-200 to-indigo-400 shadow-[0_0_20px_rgba(125,211,252,0.5)]">
                        <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center text-sky-200 font-bold text-lg">
                          {current.name.charAt(0)}
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-sky-500 border-2 border-white dark:border-[#0f1524] flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        {current.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-sky-600 dark:text-sky-300 font-medium">
                        {current.role}
                      </p>
                    </div>
                  </div>

                  {/* Quote Icon */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl glass-surface border border-sky-400/40 flex items-center justify-center text-sky-600 dark:text-sky-300 shadow-[0_0_18px_rgba(125,211,252,0.35)] shrink-0">
                    <Quote className="w-5 h-5 sm:w-6 sm:h-6 rotate-180 fill-sky-400/20 text-sky-600 dark:text-sky-300" />
                  </div>
                </div>

                {/* Star Rating */}
                <div className="my-5 flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 filter drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 ml-1">
                    {current.rating.toFixed(1)}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-normal leading-relaxed italic mb-4">
                  &ldquo;{current.quote}&rdquo;
                </p>

                {/* Outcome Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-[11px] font-mono text-sky-700 dark:text-sky-300 font-medium">
                  <span>✦ Outcome: {current.highlight}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Pagination Dots */}
            <div className="mt-8 flex items-center justify-center gap-2">
              {testimonials.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1)
                    setCurrentIndex(idx)
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex
                      ? 'w-7 bg-sky-400 shadow-[0_0_10px_#38bdf8]'
                      : 'w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonial
