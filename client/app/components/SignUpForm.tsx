"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Confetti from "react-confetti"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { EnhancedButton, EnhancedInput } from "./ui/design-system"
import GoogleSignUpButton from "./GoogleSignUpButton"
import { signupSchema } from "../common/validationSchema"
import apiClient from "../lib/axiosConfig"
import { AxiosError } from "axios"

type SignupFormData = z.infer<typeof signupSchema>

const SignupForm = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  })

  const password = form.watch("password")
  const validatePassword = (password: string) => {
    const requirements = [
      { test: password.length >= 8, message: "At least 8 characters" },
      { test: /\d/.test(password), message: "One number" },
      { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: "One special character" },
      { test: /[a-z]/.test(password), message: "One lowercase letter" },
      { test: /[A-Z]/.test(password), message: "One uppercase letter" },
    ]
    return requirements
  }

  const passwordRequirements = validatePassword(password || "")
  const isPasswordValid = passwordRequirements.every((req) => req.test)

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)

    try {
      const response = await apiClient.post("/auth/register", data)
      toast.success(response.data.message)
      setShowConfetti(true)

      setTimeout(() => {
        setShowConfetti(false)
        router.push("/pages/login")
      }, 4000)
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data.message || "Registration failed")
      } else {
        toast.error("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-6xl mx-auto p-4"
    >
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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Creating your account...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <Link href="/" className="inline-block mb-4">
              <Image src="/moneymaster.png" width={120} height={120} alt="Money Master Logo" className="mx-auto" />
            </Link>
            <CardTitle className="text-2xl font-bold text-primary">Sign Up</CardTitle>
            <CardDescription>Fill your information below or register using your social account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <EnhancedInput placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <EnhancedInput type="email" placeholder="example@gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Enter your phone number" {...field} className="input-field" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} placeholder="Enter password" {...field} className="input-field pr-10" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      {password && password.length > 0 && (
                        <div className="space-y-1">
                          {passwordRequirements.map((req, index) => (
                            <div
                              key={index}
                              className={`text-xs flex items-center space-x-1 ${
                                req.test ? "text-green-600" : "text-muted-foreground"
                              }`}
                            >
                              <span>{req.test ? "✓" : "○"}</span>
                              <span>{req.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or Sign Up with</span>
                  </div>
                </div>

                <GoogleSignUpButton />

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/pages/login" className="font-medium text-primary hover:underline">
                    Sign In
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="hidden lg:block">
          <Image
            width={600}
            height={600}
            src="/images/welcome.png"
            alt="signup-illustration"
            className="object-cover rounded-2xl shadow-lg"
          />
        </div>
      </div>
    </motion.div>
  )
}

export default SignupForm
