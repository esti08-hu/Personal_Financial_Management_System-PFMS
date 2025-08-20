"use client"
import { useBudgetStore } from "@/app/pages/store/budgetStore"
import { useState } from "react"
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
    } catch (error) {
      toast.error("Failed to set budget")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-fit flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold text-primary">Set Budget</CardTitle>
          </div>
          <CardDescription>
            Create a new budget to track your financial goals. Required fields are marked with *
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
                    <FormLabel>Budget Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Monthly Groceries, Vacation Fund" {...field} />
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
                    <FormLabel>Budget Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Deposit">
                          <div className="flex flex-col">
                            <span>Deposit</span>
                            <span className="text-xs text-muted-foreground">Income or savings goal</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Transfer">
                          <div className="flex flex-col">
                            <span>Transfer</span>
                            <span className="text-xs text-muted-foreground">Moving funds between accounts</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Withdrawal">
                          <div className="flex flex-col">
                            <span>Withdrawal</span>
                            <span className="text-xs text-muted-foreground">Expense or spending limit</span>
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
                    <FormLabel>Budget Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Enter budget amount"
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
                    <FormLabel>Target Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Setting Budget..." : "Set Budget"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SetBudget
