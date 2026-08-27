"use client"

import { useTransactionStore } from "@/app/pages/store/transactionStore"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import apiClient from "@/app/lib/axiosConfig"
import { getStoredUserId } from "@/app/pages/store/authStore"
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
  const router = useRouter()
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

  const fetchAccounts = async (userId: string) => {
    try {
      const response = await apiClient.get(`/account/${userId}`)
      const accountList = response.data?.items || response.data?.data || (Array.isArray(response.data) ? response.data : [])
      setAccounts(accountList)
    } catch (error) {
      console.error("Failed to fetch accounts", error)
      toast.error("Failed to fetch accounts")
    }
  }

  const fetchUserIdAndAccounts = async () => {
    try {
      const userId = await getStoredUserId()
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
      const selectedAccount = accounts.find((acc) => String(acc.id) === String(watchedAccountId))
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
    const selectedAccount = accounts.find((acc) => String(acc.id) === String(data.accountId))

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
      accountId: String(data.accountId),
      createdAt: data.createdAt,
      description: data.description,
    }

    try {
      await addTransaction(newTransaction)
      toast.success("Transaction added successfully!")
      form.reset()
      router.push("/pages/user/transaction/transactionList")
    } catch (error) {
      toast.error("Failed to add transaction")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedAccount = accounts.find((acc) => String(acc.id) === String(watchedAccountId))

  return (
    <div className="min-h-fit flex flex-col items-center justify-center px-4 sm:px-2 lg:px-4 py-8 animate-fade-in relative z-10 w-full">
      <Card className="w-full max-w-2xl glass-surface-elevated rounded-3xl border border-sky-400/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),0_0_45px_rgba(125,211,252,0.12)] backdrop-blur-2xl">
        <CardHeader className="border-b border-sky-400/10 pb-6 mb-6">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Transaction Form</CardTitle>
          <CardDescription className="text-sm text-slate-600 dark:text-slate-400 font-medium">Add a new transaction to your account. Required fields are marked with *</CardDescription>
        </CardHeader>
        <CardContent className="px-6 md:px-10 pb-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Transaction Type <span className="text-sky-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-input h-12 w-full rounded-xl px-4 border-sky-400/20">
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#0d1322] border-sky-400/20 shadow-2xl rounded-xl z-50 text-slate-800 dark:text-slate-100">
                        <SelectItem value="Deposit" className="cursor-pointer focus:bg-sky-500/15 focus:text-sky-500">Deposit</SelectItem>
                        <SelectItem value="Transfer" className="cursor-pointer focus:bg-sky-500/15 focus:text-sky-500">Transfer</SelectItem>
                        <SelectItem value="Withdrawal" className="cursor-pointer focus:bg-sky-500/15 focus:text-sky-500">Withdrawal</SelectItem>
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
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Account <span className="text-sky-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-input h-12 w-full rounded-xl px-4 border-sky-400/20">
                          <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#0d1322] border-sky-400/20 shadow-2xl rounded-xl z-50 text-slate-800 dark:text-slate-100">
                        {accounts.length === 0 ? (
                          <div className="p-3 text-center text-sm text-slate-500 dark:text-slate-400">
                            No accounts found. Please create an account first.
                          </div>
                        ) : (
                          accounts.map((acc) => (
                            <SelectItem key={acc.id} value={String(acc.id)} className="cursor-pointer focus:bg-sky-500/15 focus:text-sky-500">
                              <div className="flex items-center justify-between w-full gap-4">
                                <span>{acc.title}</span>
                                <Badge variant="secondary" className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20">
                                  {acc.balance} ETB
                                </Badge>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedAccount && (
                <div className="p-4 bg-sky-500/5 dark:bg-[#0a0e1a]/50 rounded-2xl border border-sky-400/10">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
                    Selected Account: <span className="font-bold text-slate-800 dark:text-white">{selectedAccount.title}</span>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Current Balance: <Badge variant="outline" className="ml-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">{selectedAccount.balance} ETB</Badge>
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Amount <span className="text-sky-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Enter amount"
                        className="glass-input h-12 w-full rounded-xl px-4 border-sky-400/20"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {balanceError && (
                <Alert className="bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-medium">{balanceError}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="createdAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date <span className="text-sky-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" className="glass-input h-12 w-full rounded-xl px-4 border-sky-400/20" {...field} />
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
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description <span className="text-sky-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter transaction description..." className="glass-input min-h-[120px] w-full rounded-xl px-4 py-3 border-sky-400/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                disabled={isLoading || !!balanceError}
                className="w-full flex items-center justify-center gap-2 h-12 mt-8 rounded-xl glass-pill-btn font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Processing..." : "Add Transaction"}
              </button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddTransaction
