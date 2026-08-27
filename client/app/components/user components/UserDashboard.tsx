"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/app/lib/axiosConfig"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"
import { Wallet, ArrowRightLeft, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Loader from "@/app/common/Loader"

interface User {
  name: string
  id: string
}

interface Transaction {
  id: string
  createdAt: string
  type: string
  amount: number
  description: string
}

interface Budget {
  id: string
  userId: string
  title: string
  type: string
  amount: number
  date: string
}

const UserDashboard = () => {
  const [user, setUser] = useState<User | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [transactionCount, setTransactionCount] = useState<number>(0)

  const fetchUserData = async () => {
    try {
      const userResponse = await apiClient.get("/auth/user-profile")
      const transactionResponse = await apiClient.get(`/transaction/recent/${userResponse.data.id}`)
      const balanceResponse = await apiClient.get(`/account/balance/${userResponse.data.id}`)
      const transactionCountResponse = await apiClient.get(`/transaction/count/${userResponse.data.id}`)
      const budgetResponse = await apiClient.get(`/budget/${userResponse.data.id}`)
      setTransactionCount(Number(transactionCountResponse.data) || 0)
      setBudgets(budgetResponse.data?.items || budgetResponse.data?.data || (Array.isArray(budgetResponse.data) ? budgetResponse.data : []))
      setUser(userResponse.data)
      setTransactions(Array.isArray(transactionResponse.data) ? transactionResponse.data : transactionResponse.data?.items || transactionResponse.data?.data || [])
      setBalance(Number(balanceResponse.data) || 0)
      setIsLoading(false)
    } catch (error) {
      toast.error("Error fetching user data")
      router.push("/pages/login")
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [router])

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex justify-center items-center w-full h-46"
      >
        <Loader />
      </motion.div>
    )
  }

  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case "Deposit":
        return "default"
      case "Withdrawal":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 w-full animate-fade-in"
    >
      <div className="glass-surface-elevated rounded-3xl p-8 border border-sky-400/20 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.4),0_0_40px_rgba(125,211,252,0.1)] relative overflow-hidden group">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-sky-400/10 dark:bg-sky-500/10 rounded-full blur-[80px] group-hover:bg-sky-400/20 transition-colors duration-700" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/20 to-indigo-500/20 border border-sky-400/30 shadow-[0_0_20px_rgba(14,165,233,0.15)]">
              <Wallet className="h-8 w-8 text-sky-600 dark:text-sky-400" />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">{user?.name ? user.name.split(" ")[0] : ""}</span>!
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Here's an overview of your financial activity</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col text-right">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1">Current balance</span>
              <span className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-sky-400 dark:from-sky-400 dark:to-sky-200 drop-shadow-sm">{balance.toFixed(2)} ETB</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/pages/user/transaction/addTransaction")}
                className="px-4 py-2 rounded-xl glass-surface border border-sky-400/30 text-sm font-semibold hover:bg-sky-500/10 hover:border-sky-400/50 transition-all text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Add Transaction
              </button>
              <button
                onClick={() => router.push("/pages/user/report")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[0_5px_20px_rgba(14,165,233,0.3)] hover:from-sky-400 hover:to-indigo-400 text-sm font-semibold transition-all cursor-pointer" 
              >
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-surface rounded-2xl border border-sky-400/20 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/10 rounded-full blur-[40px] group-hover:bg-sky-400/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Current Balance</CardTitle>
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.15)]">
              <Wallet className="h-5 w-5 text-sky-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{balance.toFixed(2)} <span className="text-xl text-slate-400">ETB</span></div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Total account balance</p>
          </CardContent>
        </Card>

        <Card className="glass-surface rounded-2xl border border-sky-400/20 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-[40px] group-hover:bg-indigo-400/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Total Transactions</CardTitle>
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <ArrowRightLeft className="h-5 w-5 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{transactionCount}</div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">All time transactions</p>
          </CardContent>
        </Card>

        <Card className="glass-surface rounded-2xl border border-sky-400/20 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-[40px] group-hover:bg-emerald-400/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Active Budgets</CardTitle>
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{budgets.length}</div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Current budget plans</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-surface rounded-3xl border border-sky-400/20 shadow-lg overflow-hidden">
        <CardHeader className="border-b border-sky-400/10 bg-slate-50/50 dark:bg-[#0a0e1a]/50 py-5">
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-sky-400/10 text-slate-500 dark:text-slate-400">
                <TableHead className="font-semibold px-6 py-4">Date</TableHead>
                <TableHead className="font-semibold px-6 py-4">Type</TableHead>
                <TableHead className="font-semibold px-6 py-4">Amount</TableHead>
                <TableHead className="font-semibold px-6 py-4">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {transactions.length > 0 ? transactions.map((transaction) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border-sky-400/10 glass-surface-hover transition-colors"
                  >
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300 px-6 py-4">
                      {new Date(transaction.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                        transaction.type === "Deposit" 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                          : transaction.type === "Withdrawal"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                            : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                      }`}>
                        {transaction.type}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`font-bold px-6 py-4 ${transaction.type === "Deposit" ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {transaction.type === "Deposit" ? "+" : "-"}
                      {transaction.amount} <span className="text-xs font-medium opacity-70">ETB</span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-slate-600 dark:text-slate-400 px-6 py-4">
                      {transaction.description}
                    </TableCell>
                  </motion.tr>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500 dark:text-slate-400">
                      No recent transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default UserDashboard
