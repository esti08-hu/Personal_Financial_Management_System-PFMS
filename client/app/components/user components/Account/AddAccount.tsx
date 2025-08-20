"use client"
import { useAccountStore } from "@/app/pages/store/accountStore"
import { useEffect, useState } from "react"
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
    <div className="min-h-fit flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plus className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold text-primary">Add New Account</CardTitle>
          </div>
          <CardDescription>
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
                    <FormLabel>Account Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Main Checking, Emergency Fund" {...field} />
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
                    <FormLabel>Account Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Checking">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <div className="flex flex-col">
                              <span>Checking Account</span>
                              <span className="text-xs text-muted-foreground">For daily transactions</span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Saving">
                          <div className="flex items-center gap-2">
                            <PiggyBank className="h-4 w-4" />
                            <div className="flex flex-col">
                              <span>Savings Account</span>
                              <span className="text-xs text-muted-foreground">For long-term savings</span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Business">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <div className="flex flex-col">
                              <span>Business Account</span>
                              <span className="text-xs text-muted-foreground">For business expenses</span>
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
                    <FormLabel>Initial Balance *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddAccount
