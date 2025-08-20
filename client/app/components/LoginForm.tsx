"use client";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Button } from "@/components/ui/button";
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
import { EnhancedButton, EnhancedInput } from "./ui/design-system";
import GoogleLoginButton from "./GoogleLoginButton";
import { signinSchema } from "../common/validationSchema";
import Loader from "../common/Loader";

type FormData = z.infer<typeof signinSchema>;

const LoginForm = () => {
  const router = useRouter();
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
      await axios.post(
        "http://localhost:3001/email-confirmation/resend-confirmation-link",
        { email },
        { withCredentials: true }
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
      const response = await axios.post(
        "http://localhost:3001/auth/login",
        data,
        {
          withCredentials: true,
        }
      );

      if (data.rememberMe) {
        // Handle remember me functionality
        console.log("Remember me is checked");
      }

      toast.success("Logged in successfully!");

      setTimeout(() => {
        if (response.status === 201) {
          router.push("/pages/user");
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
    <div
      style={{ background: "hsl(var(--color-primary) / 0.06)" }}
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl !min-w-4xl w-full flex items-center gap-8">
        <Card className="w-full max-w-md mx-auto bg-primary-foreground">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Link href="/">
                <Image
                  src="/images/logo/moneymaster.png"
                  width={120}
                  height={120}
                  alt="Money Master Logo"
                />
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-[#22577A]">
              Sign In
            </CardTitle>
            <CardDescription className="text-center text-[#6C7278]">
              Fill your information below or signin using your social account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {showConfirmDialog && (
              <Alert>
                <AlertDescription>
                  Please confirm your email first to login.
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={handleResendConfirmation}>
                      Resend
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowConfirmDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <EnhancedInput
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  {...register("email")}
                  error={errors.email?.message}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <EnhancedInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    {...register("password")}
                    error={errors.password?.message}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    {...register("rememberMe")}
                  />
                  <Label htmlFor="rememberMe" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/pages/forgotpassword"
                  className="text-sm text-[#37a5bb] hover:text-[#24869a] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <EnhancedButton
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader />
                    <span className="ml-2">Signing in...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </EnhancedButton>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    or Sign In with
                  </span>
                </div>
              </div>

              <GoogleLoginButton />

              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/pages/signup"
                  className="text-[#00ABCD] font-semibold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="hidden lg:block flex-1">
          <Image
            width={500}
            height={500}
            src="/images/login.png"
            alt="Login illustration"
            className="object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
