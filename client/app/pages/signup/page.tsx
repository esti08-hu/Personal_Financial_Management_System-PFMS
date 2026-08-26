import SignupForm from "@/app/components/SignUpForm";
import React from "react";

const SignUpPage = () => {
  return (
    <div className="min-h-screen w-full bg-[#f0f6fc] dark:bg-[#0a0e1a] text-slate-800 dark:text-slate-100 relative flex justify-center items-center overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-900 dark:selection:text-sky-200 transition-colors duration-300">
      {/* Background Decorative Ethereal Gradients & Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[650px] h-[650px] rounded-full bg-sky-400/20 dark:bg-sky-500/10 blur-[150px]" />
        <div className="absolute top-[35%] -left-[10%] w-[550px] h-[550px] rounded-full bg-indigo-400/15 dark:bg-indigo-600/10 blur-[160px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] rounded-full bg-sky-300/20 dark:bg-sky-400/10 blur-[150px]" />
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(56, 189, 248, 0.5) 1px, transparent 1px)`,
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 flex justify-center items-center py-12">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignUpPage;
