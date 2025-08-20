"use client"

import { useTransactionStore } from "@/app/pages/store/transactionStore"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import apiClient from "@/app/lib/axiosConfig"
import type { Account, NewTransaction } from "@/app/types/acc"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const transactionSchema = z.object({
  type: z.enum(["Deposit", "Transfer", "Withdrawal"]),
  accountId: z.string().min(1, "Please select an account"),
  amount: z.number().min(1, "Amount must be at least 1"),
  createdAt: z.string().min(1, "Date is required"),
  description: z.string().min(2, "Description must be at least 2 characters"),
})

type TransactionFormData = z.infer<typeof transactionSchema>

const AddTransaction = () => {
  const addTransaction = useTransactionStore((state) => state.addTransaction)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [balanceError, setBalanceError] = useState<string>("")

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "Deposit",
      accountId: "",
      amount: 1,
      createdAt: "",
      description: "",
    },
  })

  const watchedType = form.watch("type")
  const watchedAccountId = form.watch("accountId")
  const watchedAmount = form.watch("amount")

  const fetchAccounts = async (userId: number) => {
    try {
      const response = await apiClient.get(`/account/${userId}`)
      const data = await response.data
      setAccounts(data)
    } catch (error) {
      console.error("Failed to fetch accounts", error)
      toast.error("Failed to fetch accounts")
    }
  }

  const fetchUserIdAndAccounts = async () => {
    try {
      const userIdResponse = await apiClient.get("/user/userId")
      const userId = userIdResponse.data
      fetchAccounts(userId)
    } catch (error) {
      console.error("Failed to fetch user ID", error)
      toast.error("Failed to fetch user ID")
    }
  }

  useEffect(() => {
    fetchUserIdAndAccounts()
  }, [])

  useEffect(() => {
    if (watchedAccountId && watchedAmount) {
      const selectedAccount = accounts.find((acc) => acc.id === Number(watchedAccountId))
      if (selectedAccount && (watchedType === "Withdrawal" || watchedType === "Transfer")) {
        if (watchedAmount > selectedAccount.balance) {
          setBalanceError("Amount exceeds account balance")
        } else {
          setBalanceError("")
        }
      } else {
        setBalanceError("")
      }
    }
  }, [watchedAmount, watchedAccountId, watchedType, accounts])

  const onSubmit = async (data: TransactionFormData) => {
    const selectedAccount = accounts.find((acc) => acc.id === Number(data.accountId))

    if (!selectedAccount) {
      toast.error("No account selected")
      return
    }

    // Calculate updated balance based on the transaction type
    let updatedBalance: number
    if (data.type === "Deposit") {
      updatedBalance = selectedAccount.balance + data.amount
    } else if (data.type === "Withdrawal" || data.type === "Transfer") {
      if (data.amount > selectedAccount.balance) {
        toast.error("Insufficient balance")
        return
      }
      updatedBalance = selectedAccount.balance - data.amount
    } else {
      toast.error("Invalid transaction type")
      return
    }

    setIsLoading(true)

    const newTransaction: NewTransaction = {
      type: data.type,
      amount: data.amount,
      balance: updatedBalance,
      accountId: Number(data.accountId),
      createdAt: data.createdAt,
      description: data.description,
    }

    try {
      await addTransaction(newTransaction, selectedAccount.userId)
      toast.success("Transaction added successfully!")
      form.reset()
      fetchUserIdAndAccounts()
    } catch (error) {
      toast.error("Failed to add transaction")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedAccount = accounts.find((acc) => acc.id === Number(watchedAccountId))

  return (
    <div className="min-h-fit flex items-center justify-center px-4 sm:px-2 lg:px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Transaction Form</CardTitle>
          <CardDescription>Add a new transaction to your account. Required fields are marked with *</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background">
                        <SelectItem value="Deposit">Deposit</SelectItem>
                        <SelectItem value="Transfer">Transfer</SelectItem>
                        <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span>{acc.title}</span>
                              <Badge variant="secondary" className="ml-2">
                                {acc.balance} ETB
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedAccount && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Selected Account: <span className="font-medium">{selectedAccount.title}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Current Balance: <Badge variant="outline">{selectedAccount.balance} ETB</Badge>
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Enter amount"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {balanceError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{balanceError}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="createdAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter transaction description..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading || !!balanceError} className="w-full" size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Adding Transaction..." : "Add Transaction"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddTransaction
