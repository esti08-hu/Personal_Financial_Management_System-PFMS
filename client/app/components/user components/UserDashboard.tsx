"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/app/lib/axiosConfig"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
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
  const [isClient, setIsClient] = useState(false)

  const fetchUserData = async () => {
    try {
      const userResponse = await apiClient.get("/auth/user-profile")
      const transactionResponse = await apiClient.get(`/transaction/recent/${userResponse.data.id}`)
      const balanceResponse = await apiClient.get(`account/balance${userResponse.data.id}`)
      const transactionCountResponse = await apiClient.get(`/transaction/count/${userResponse.data.id}`)
      const budgetResponse = await apiClient.get(`/budget/${userResponse.data.id}`)
      setTransactionCount(transactionCountResponse.data)
      setBudgets(budgetResponse.data)
      setUser(userResponse.data)
      setTransactions(transactionResponse.data)
      setBalance(balanceResponse.data)
      setIsLoading(false)
    } catch (error) {
      toast.error("Error fetching user data")
      router.push("/pages/login")
    }
  }

  useEffect(() => {
    setIsClient(true)
    fetchUserData()
  }, [router])

  if (!isClient) return null

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
      className="space-y-8 dashboard-gradient p-6 rounded-lg"
    >
      <div className="enhanced-card bg-card/60 backdrop-blur-sm rounded-lg p-6 border border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 no-card-hover">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/40">
            <Wallet className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Welcome back, <span className="text-primary">{user?.name}</span>!
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Here's an overview of your financial activity</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-xs text-muted-foreground">Current balance</span>
            <span className="text-lg md:text-xl font-semibold text-primary">{balance.toFixed(2)} ETB</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="border border-border/40">Add Transaction</Button>
            <Button variant="outline" size="sm">View Reports</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card className="enhanced-card stat-card dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{balance.toFixed(2)} ETB</div>
            <p className="text-xs text-muted-foreground">Total account balance</p>
          </CardContent>
        </Card>

  <Card className="enhanced-card stat-card dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <ArrowRightLeft className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{transactionCount}</div>
            <p className="text-xs text-muted-foreground">All time transactions</p>
          </CardContent>
        </Card>

  <Card className="enhanced-card stat-card dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{budgets.length}</div>
            <p className="text-xs text-muted-foreground">Current budget plans</p>
          </CardContent>
        </Card>
      </div>

  <Card className="enhanced-card dashboard-card no-card-hover">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-primary">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {transactions.map((transaction) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <TableCell className="font-medium">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTransactionBadgeVariant(transaction.type)} className="font-medium">
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`font-semibold ${transaction.type === "Deposit" ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.type === "Deposit" ? "+" : "-"}
                      {transaction.amount} ETB
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {transaction.description}
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default UserDashboard
