"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import Model from "@/app/components/user components/Model"
import Loader from "../../../common/Loader"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Trash2, Plus, Search, Filter, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react"
import type { EditTransaction } from "@/app/types/acc"
import { useTransactionStore } from "@/app/pages/store/transactionStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const TransactionList = () => {
  const { transactions, fetchTransactions, editTransaction, deleteTransaction } = useTransactionStore()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editTransactionData, setEditTransactionData] = useState<EditTransaction>({
    id: "",
    account: { id: "", title: "", balance: 0 },
    createdAt: "",
    type: "",
    amount: 0,
    description: "",
  })

  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Filter and search transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      (transaction.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (transaction.account?.title?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || transaction.type?.toLowerCase() === filterType.toLowerCase()
    return matchesSearch && matchesFilter
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Calculate summary statistics
  const totalDeposits = transactions
    .filter((t) => {
      const type = t.type?.toLowerCase()
      return type === "deposit" || type === "income"
    })
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  const totalWithdrawals = transactions
    .filter((t) => {
      const type = t.type?.toLowerCase()
      return type === "withdrawal" || type === "expense" || type === "transfer"
    })
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  const netAmount = totalDeposits - totalWithdrawals

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await fetchTransactions()
      setIsLoading(false)
    }

    fetchData()
  }, [fetchTransactions])

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterType])

  const handleEdit = (transaction: EditTransaction) => {
    setIsEditing(true)
    setEditTransactionData(transaction)
  }

  const handleDelete = async (id: string) => {
    await deleteTransaction(id)
    await fetchTransactions()
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    await editTransaction(editTransactionData)
    await fetchTransactions()
    setIsEditing(false)
    setEditTransactionData({
      id: "",
      account: { id: "", title: "", balance: 0 },
      createdAt: "",
      type: "",
      amount: 0,
      description: "",
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditTransactionData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case "Deposit":
        return "default"
      case "Withdrawal":
        return "destructive"
      case "Transfer":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-5 w-5" />
            <CardTitle>Transaction History</CardTitle>
          </div>
          <CardDescription>Loading your transaction history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40 w-full">
            <Loader />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-5 w-5" />
            <CardTitle>Transaction History</CardTitle>
          </div>
          <CardDescription>Track all your financial transactions in one place</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="rounded-full bg-muted p-6">
              <ArrowUpDown className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">No transactions found</h3>
              <p className="text-muted-foreground max-w-md">
                You haven't recorded any transactions yet. Start by adding your first transaction to track your
                financial activity.
              </p>
            </div>
            <Button asChild className="mt-4">
              <Link href="/pages/user/transaction/addTransaction">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Transaction
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-surface rounded-2xl border border-sky-400/20 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-[40px] group-hover:bg-emerald-400/20 transition-colors" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Total Deposits</p>
                <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400 drop-shadow-sm">+{totalDeposits.toLocaleString()} <span className="text-sm font-medium opacity-70">ETB</span></p>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-surface rounded-2xl border border-sky-400/20 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/10 rounded-full blur-[40px] group-hover:bg-red-400/20 transition-colors" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Total Withdrawals</p>
                <p className="text-2xl font-bold text-red-500 dark:text-red-400 drop-shadow-sm">-{totalWithdrawals.toLocaleString()} <span className="text-sm font-medium opacity-70">ETB</span></p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-surface rounded-2xl border border-sky-400/20 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/10 rounded-full blur-[40px] group-hover:bg-sky-400/20 transition-colors" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Net Amount</p>
                <p className={`text-2xl font-bold drop-shadow-sm ${netAmount >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                  {netAmount >= 0 ? "+" : ""}
                  {netAmount.toLocaleString()} <span className="text-sm font-medium opacity-70">ETB</span>
                </p>
              </div>
              <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.15)]">
                <ArrowUpDown className="h-6 w-6 text-sky-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-surface-elevated rounded-3xl border border-sky-400/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),0_0_45px_rgba(125,211,252,0.12)] backdrop-blur-2xl overflow-hidden mt-8">
        <CardHeader className="border-b border-sky-400/10 bg-slate-50/50 dark:bg-[#0a0e1a]/50 py-6 px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.15)]">
                <ArrowUpDown className="h-5 w-5 text-sky-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">Transaction History</CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage your financial transactions ({transactions.length} total)</CardDescription>
              </div>
            </div>
            <Link href="/pages/user/transaction/addTransaction" className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[0_5px_20px_rgba(14,165,233,0.3)] hover:from-sky-400 hover:to-indigo-400 text-sm font-semibold transition-all">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input h-12 w-full rounded-xl pl-12 pr-4 border-sky-400/20"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="glass-input h-12 w-full sm:w-48 rounded-xl px-4 border-sky-400/20">
                <Filter className="h-4 w-4 mr-2 text-sky-500" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#0d1322] border-sky-400/20 shadow-xl rounded-xl">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Deposit">Deposits</SelectItem>
                <SelectItem value="Withdrawal">Withdrawals</SelectItem>
                <SelectItem value="Transfer">Transfers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl border border-sky-400/20 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-sky-400/10 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-[#0a0e1a]/50">
                  <TableHead className="font-semibold px-6 py-4">Type</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Amount</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Account</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Description</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Date</TableHead>
                  <TableHead className="text-center font-semibold px-6 py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {paginatedTransactions.map((transaction) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="group border-sky-400/10 glass-surface-hover transition-colors"
                      >
                        <TableCell className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                            (transaction.type?.toLowerCase() === "deposit" || transaction.type?.toLowerCase() === "income")
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                              : (transaction.type?.toLowerCase() === "withdrawal" || transaction.type?.toLowerCase() === "expense")
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                          }`}>
                            {transaction.type}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold px-6 py-4">
                          <span className={(transaction.type?.toLowerCase() === "deposit" || transaction.type?.toLowerCase() === "income") ? "text-emerald-500" : "text-red-500"}>
                            {(transaction.type?.toLowerCase() === "deposit" || transaction.type?.toLowerCase() === "income") ? "+" : "-"}
                            {Number(transaction.amount || 0).toLocaleString()} <span className="text-xs font-medium opacity-70">ETB</span>
                          </span>
                        </TableCell>
                        <TableCell className="max-w-32 truncate font-medium text-slate-700 dark:text-slate-300 px-6 py-4">{transaction.account?.title}</TableCell>
                        <TableCell className="max-w-32 truncate text-slate-600 dark:text-slate-400 px-6 py-4">{transaction.description}</TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400 px-6 py-4 font-medium">
                          {new Date(transaction.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 transition-colors cursor-pointer"
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of{" "}
                {filteredTransactions.length} transactions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                  return page <= totalPages ? (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  ) : null
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <Model
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleUpdate={handleUpdate}
          handleChange={handleChange}
          editTransactionData={editTransactionData}
        />
      )}
    </div>
  )
}

export default TransactionList
