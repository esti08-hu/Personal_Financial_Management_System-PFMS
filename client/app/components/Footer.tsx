import React from "react";
import Link from "next/link";
import { Linkedin, Twitter, Github, Shield, Sparkles } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full border-t border-sky-400/20 dark:border-sky-400/10 bg-sky-50/80 dark:bg-[#070b14]/90 pt-16 pb-12 px-4 sm:px-6 lg:px-12 backdrop-blur-2xl transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-sky-400/20 dark:border-sky-400/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 p-[1.5px] shadow-[0_0_15px_rgba(125,211,252,0.4)]">
                <div className="w-full h-full bg-slate-900 dark:bg-[#0b101d] rounded-[10px] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-sky-300" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 18 L10 12 L14 16 L20 6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 6 L20 6 L20 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white block">
                  MoneyMaster
                </span>
                <span className="text-[11px] font-medium text-sky-400/80 tracking-wide uppercase">
                  Personal Finance Manager
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
              Empowering Your Financial Journey. Atmospheric, real-time intelligence engineered with privacy-first encryption.
            </p>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/25 text-xs text-sky-300 font-mono font-medium">
                <Shield className="w-3 h-3 text-sky-400" />
                SOC-2 Type II Certified
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-3 text-sm">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-900 dark:text-white font-semibold mb-1">
              Product
            </h4>
            {["Features", "Pricing", "Security", "Roadmap"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-slate-400 hover:text-sky-300 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Company Links */}
          <div className="flex flex-col gap-3 text-sm">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-900 dark:text-white font-semibold mb-1">
              Company
            </h4>
            {["About", "Careers", "Press", "Contact"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Connect / Socials */}
          <div className="flex flex-col gap-3 text-sm">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-900 dark:text-white font-semibold mb-1">
              Connect
            </h4>
            <div className="flex items-center gap-3 mb-2">
              {[
                { icon: Linkedin, label: "LinkedIn" },
                { icon: Twitter, label: "Twitter" },
                { icon: Github, label: "GitHub" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="w-8 h-8 rounded-lg glass-surface border border-sky-400/20 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 hover:border-sky-300 transition-all"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            {["Blog", "Support", "Legal"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          <div>
            © {currentYear} MoneyMaster. All rights reserved. |{" "}
            <Link href="#" className="hover:text-slate-200 transition-colors">Privacy Policy</Link> |{" "}
            <Link href="#" className="hover:text-slate-200 transition-colors">Terms of Service</Link>.
          </div>
          <div className="flex items-center gap-1.5 text-sky-400/70 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MoneyMaster Glass Interface</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
