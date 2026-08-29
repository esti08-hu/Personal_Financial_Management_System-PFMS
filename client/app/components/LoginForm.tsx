"use client";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import apiClient from "../lib/axiosConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import GoogleLoginButton from "./GoogleLoginButton";
import { signinSchema } from "../common/validationSchema";
import Loader from "../common/Loader";
import { useAuthStore } from "@/app/pages/store/authStore";

type FormData = z.infer<typeof signinSchema>;

const LoginForm = () => {
  const router = useRouter();
  const setUserId = useAuthStore((state) => state.setUserId);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
      isAdmin: false,
    },
  });

  const rememberMe = watch("rememberMe");

  useEffect(() => {
    const emailConfirmedParam = new URLSearchParams(window.location.search).get(
      "emailConfirmed"
    );
    if (emailConfirmedParam) {
      toast.success(
        "Your email has been confirmed successfully! Please log in."
      );
      setTimeout(() => {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }, 500);
    }
  }, []);

  const handleResendConfirmation = async () => {
    try {
      const email = getValues("email");
      await apiClient.post(
        "/email-confirmation/resend-confirmation-link",
        { email }
      );
      toast.success("Confirmation link resent!");
      setShowConfirmDialog(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "An error occurred");
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      const response = await apiClient.post(
        "/auth/login",
        data
      );

      if (data.rememberMe) {
        // Handle remember me functionality
      }

      if (response.data?.userId) {
        setUserId(response.data.userId)
      }

      toast.success("Logged in successfully!");

      setTimeout(() => {
        if (response.status === 201) {
          router.push("/pages/user")
        }
      }, 1000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (
          err.response?.data.message === "Please confirm your email to Login"
        ) {
          setShowConfirmDialog(true);
        } else {
          toast.error(
            err.response?.data.message || "An unexpected error occurred."
          );
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in relative z-10">
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
            Welcome Back
          </h2>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Enter your credentials to access your account
          </p>
        </div>

        {showConfirmDialog && (
          <Alert className="mb-6 bg-sky-500/10 border-sky-400/30 text-sky-800 dark:text-sky-200">
            <AlertDescription className="text-sm">
              Please confirm your email first to login.
              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition-colors"
                >
                  Resend Link
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-transparent border border-sky-400/30 hover:bg-sky-500/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Address <span className="text-sky-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="glass-input h-11 w-full rounded-xl px-4"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Password <span className="text-sky-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="glass-input h-11 w-full rounded-xl pl-4 pr-10"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sky-500 transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                {...register("rememberMe")}
                className="border-sky-400/40 data-[state=checked]:bg-sky-500 data-[state=checked]:text-white rounded-[4px]"
              />
              <Label htmlFor="rememberMe" className="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                Remember me
              </Label>
            </div>
            <Link
              href="/pages/forgotpassword"
              className="text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-500 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 h-11 mt-6 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/40 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-300 dark:border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#f0f6fc] dark:bg-[#0f1524] px-3 text-slate-500 dark:text-slate-400 font-semibold rounded-full border border-slate-300/50 dark:border-slate-700/50">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleLoginButton />

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
            Don't have an account?{" "}
            <Link
              href="/pages/signup"
              className="text-sky-600 dark:text-sky-400 font-semibold hover:text-sky-500 transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
