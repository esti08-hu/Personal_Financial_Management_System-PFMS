"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Confetti from "react-confetti";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import GoogleSignUpButton from "./GoogleSignUpButton";
import { signupSchema } from "../common/validationSchema";
import apiClient from "../lib/axiosConfig";
import { AxiosError } from "axios";

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const password = form.watch("password");
  const validatePassword = (password: string) => {
    const requirements = [
      { test: password.length >= 8, message: "At least 8 characters" },
      { test: /\d/.test(password), message: "One number" },
      {
        test: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        message: "One special character",
      },
      { test: /[a-z]/.test(password), message: "One lowercase letter" },
      { test: /[A-Z]/.test(password), message: "One uppercase letter" },
    ];
    return requirements;
  };

  const passwordRequirements = validatePassword(password || "");
  const isPasswordValid = passwordRequirements.every((req) => req.test);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/register", data);
      toast.success(response.data.message);
      setShowConfetti(true);

      setTimeout(() => {
        setShowConfetti(false);
        router.push("/pages/login");
      }, 4000);
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data.message || "Registration failed");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        </div>
      )}

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0f1524]/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="flex items-center space-x-2 text-sky-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="font-medium text-white">Creating your account...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto relative z-10"
      >
        <div className="p-8 sm:p-10 rounded-3xl glass-surface-elevated border border-sky-400/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_45px_rgba(125,211,252,0.12)] backdrop-blur-2xl">
          <div className="space-y-2 mb-8">
            <div className="flex justify-center mb-6">
              <Link href="/" aria-label="Go to Home">
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 p-[1px] shadow-[0_0_15px_rgba(125,211,252,0.4)] group hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-slate-100 dark:bg-[#0d1322] rounded-[15px] flex items-center justify-center">
                    <div className="w-6 h-6 rounded-[6px] bg-gradient-to-tr from-sky-400 via-sky-300 to-indigo-300 rotate-45 group-hover:rotate-90 transition-transform duration-500" />
                  </div>
                </div>
              </Link>
            </div>
            <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white tracking-tight">
              Create an Account
            </h2>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Enter your details to get started
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Name <span className="text-sky-500">*</span>
                    </FormLabel>
                    <Input 
                      placeholder="Enter your name" 
                      className="glass-input h-11 w-full rounded-xl px-4" 
                      {...field} 
                    />
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email <span className="text-sky-500">*</span>
                    </FormLabel>
                    <Input 
                      type="email" 
                      placeholder="example@gmail.com" 
                      className="glass-input h-11 w-full rounded-xl px-4" 
                      {...field} 
                    />
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Phone <span className="text-sky-500">*</span>
                    </FormLabel>
                    <Input 
                      type="tel" 
                      placeholder="Enter your phone number" 
                      className="glass-input h-11 w-full rounded-xl px-4" 
                      {...field} 
                    />
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Password <span className="text-sky-500">*</span>
                    </FormLabel>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        className="glass-input h-11 w-full rounded-xl pl-4 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sky-500 transition-colors focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {password && password.length > 0 && (
                      <div className="space-y-1.5 mt-2 p-3 rounded-lg bg-slate-100/50 dark:bg-[#0a0e1a]/50 border border-slate-200 dark:border-sky-400/10">
                        {passwordRequirements.map((req, index) => (
                          <div
                            key={index}
                            className={`text-xs flex items-center space-x-2 ${
                              req.test ? "text-emerald-500" : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            <span className={req.test ? "opacity-100" : "opacity-40"}>{req.test ? "✓" : "○"}</span>
                            <span>{req.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 h-11 mt-6 rounded-xl glass-pill-btn font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-300 dark:border-slate-700/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#f0f6fc] dark:bg-[#0f1524] px-3 text-slate-500 dark:text-slate-400 font-semibold rounded-full border border-slate-300/50 dark:border-slate-700/50">
                    or Sign Up with
                  </span>
                </div>
              </div>

              <GoogleSignUpButton />

              <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
                Already have an account? {" "}
                <Link href="/pages/login" className="text-sky-600 dark:text-sky-400 font-semibold hover:text-sky-500 transition-colors">
                  Sign In
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </motion.div>
    </>
  );
};

export default SignupForm;
