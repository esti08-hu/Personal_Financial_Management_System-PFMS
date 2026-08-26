"use client"
import { useAccountStore } from "@/app/pages/store/accountStore"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import type { NewAccount } from "@/app/types/acc"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, CreditCard, PiggyBank, Building } from "lucide-react"

const accountSchema = z.object({
  title: z.string().min(2, "Account title must be at least 2 characters"),
  type: z.enum(["Checking", "Saving", "Business"], {
    required_error: "Please select an account type",
  }),
  balance: z.number().min(0, "Initial balance cannot be negative"),
})

type AccountFormData = z.infer<typeof accountSchema>

const AddAccount = () => {
  const [isClient, setIsClient] = useState(false)
  const addAccount = useAccountStore((state) => state.addAccount)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      title: "",
      type: undefined,
      balance: 0,
    },
  })

  const onSubmit = async (data: AccountFormData) => {
    setIsLoading(true)

    const newAccount: NewAccount = {
      type: data.type,
      balance: data.balance,
      title: data.title,
    }

    try {
      await addAccount(newAccount)
      toast.success("Account created successfully!")
      form.reset()
      router.push("/pages/user/account/manageAccount")
    } catch (error) {
      toast.error("Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "Checking":
        return <CreditCard className="h-4 w-4" />
      case "Saving":
        return <PiggyBank className="h-4 w-4" />
      case "Business":
        return <Building className="h-4 w-4" />
      default:
        return null
    }
  }

  if (!isClient) return null

  return (
    <div className="min-h-fit flex flex-col items-center justify-center px-4 py-8 animate-fade-in relative z-10 w-full">
      <Card className="w-full max-w-2xl glass-surface-elevated rounded-3xl border border-sky-400/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),0_0_45px_rgba(125,211,252,0.12)] backdrop-blur-2xl">
        <CardHeader className="border-b border-sky-400/10 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.15)]">
              <Plus className="h-6 w-6 text-sky-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Add New Account</CardTitle>
          </div>
          <CardDescription className="text-sm text-slate-600 dark:text-slate-400 font-medium pt-2">
            Create a new financial account to track your money. Required fields are marked with *
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Account Title <span className="text-sky-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Main Checking, Emergency Fund" className="glass-input h-12 w-full rounded-xl px-4 border-sky-400/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Account Type <span className="text-sky-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-input h-12 w-full rounded-xl px-4 border-sky-400/20">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#0d1322] border-sky-400/20 shadow-2xl rounded-xl z-50 text-slate-800 dark:text-slate-100">
                        <SelectItem value="Checking" className="cursor-pointer focus:bg-sky-500/15 focus:text-sky-500">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-sky-500" />
                            <div className="flex flex-col">
                              <span className="font-semibold">Checking Account</span>
                              <span className="text-xs text-slate-400">For daily transactions</span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Saving" className="cursor-pointer focus:bg-sky-500/15 focus:text-sky-500">
                          <div className="flex items-center gap-2">
                            <PiggyBank className="h-4 w-4 text-sky-500" />
                            <div className="flex flex-col">
                              <span className="font-semibold">Savings Account</span>
                              <span className="text-xs text-slate-400">For long-term savings</span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Business" className="cursor-pointer focus:bg-sky-500/15 focus:text-sky-500">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-sky-500" />
                            <div className="flex flex-col">
                              <span className="font-semibold">Business Account</span>
                              <span className="text-xs text-slate-400">For business expenses</span>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Initial Balance <span className="text-sky-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        className="glass-input h-12 w-full rounded-xl px-4 border-sky-400/20"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 h-12 mt-8 rounded-xl glass-pill-btn font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Processing..." : "Create Account"}
              </button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddAccount
