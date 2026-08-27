"use client"
import { useBudgetStore } from "@/app/pages/store/budgetStore"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import type { NewBudget } from "@/app/types/acc"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Target } from "lucide-react"

const budgetSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  type: z.enum(["Deposit", "Transfer", "Withdrawal"], {
    required_error: "Please select a budget type",
  }),
  amount: z.number().min(1, "Amount must be at least 1"),
  date: z.string().min(1, "Date is required"),
})

type BudgetFormData = z.infer<typeof budgetSchema>

const SetBudget = () => {
  const setBudget = useBudgetStore((state) => state.setBudget)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      title: "",
      type: undefined,
      amount: 0,
      date: "",
    },
  })

  const onSubmit = async (data: BudgetFormData) => {
    setIsLoading(true)

    const newBudget: NewBudget = {
      type: data.type,
      amount: data.amount,
      date: data.date,
      title: data.title,
    }

    try {
      await setBudget(newBudget)
      toast.success("Budget set successfully!")
      form.reset()
      router.push("/pages/user/budget/manageBudget")
    } catch (error) {
      toast.error("Failed to set budget")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-fit flex flex-col items-center justify-center px-4 py-8 animate-fade-in relative z-10 w-full">
      <Card className="w-full max-w-2xl glass-surface-elevated rounded-3xl border border-sky-400/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),0_0_45px_rgba(125,211,252,0.12)] backdrop-blur-2xl">
        <CardHeader className="border-b border-sky-400/10 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.15)]">
              <Target className="h-6 w-6 text-sky-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Set Budget</CardTitle>
          </div>
          <CardDescription className="text-sm text-slate-600 dark:text-slate-400 font-medium pt-2">
            Create a new budget to track your financial goals. Required fields are marked with *
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 md:px-10 pb-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Budget Title <span className="text-sky-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Monthly Groceries, Vacation Fund" className="glass-input h-12 w-full rounded-xl px-4 border-sky-400/20" {...field} />
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
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Budget Type <span className="text-sky-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-input h-12 w-full rounded-xl px-4 border-sky-400/20">
                          <SelectValue placeholder="Select budget type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#0d1322] border-sky-400/20 shadow-2xl rounded-xl z-50 text-slate-800 dark:text-slate-100">
                        <SelectItem value="Deposit" className="cursor-pointer focus:bg-sky-500/15 focus:text-sky-500">
                          <div className="flex flex-col">
                            <span className="font-semibold">Deposit</span>
                            <span className="text-xs text-slate-400">Income or savings goal</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Transfer" className="cursor-pointer focus:bg-sky-500/15 focus:text-sky-500">
                          <div className="flex flex-col">
                            <span className="font-semibold">Transfer</span>
                            <span className="text-xs text-slate-400">Moving funds between accounts</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Withdrawal" className="cursor-pointer focus:bg-sky-500/15 focus:text-sky-500">
                          <div className="flex flex-col">
                            <span className="font-semibold">Withdrawal</span>
                            <span className="text-xs text-slate-400">Expense or spending limit</span>
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Budget Amount <span className="text-sky-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Enter budget amount"
                        className="glass-input h-12 w-full rounded-xl px-4 border-sky-400/20"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Date <span className="text-sky-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" className="glass-input h-12 w-full rounded-xl px-4 border-sky-400/20" {...field} />
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
                {isLoading ? "Processing..." : "Set Budget"}
              </button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SetBudget
