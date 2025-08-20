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
    id: 0,
    account: { id: 0, title: "", balance: 0 },
    createdAt: "",
    type: "",
    amount: 0,
    description: "",
  })

  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Filter and search transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.account?.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || transaction.type === filterType
    return matchesSearch && matchesFilter
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Calculate summary statistics
  const totalDeposits = transactions.filter((t) => t.type === "Deposit").reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawals = transactions.filter((t) => t.type === "Withdrawal").reduce((sum, t) => sum + t.amount, 0)
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

  const handleDelete = async (id: number) => {
    await deleteTransaction(id)
    await fetchTransactions()
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    await editTransaction(editTransactionData)
    await fetchTransactions()
    setIsEditing(false)
    setEditTransactionData({
      id: 0,
      account: { id: 0, title: "", balance: 0 },
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Deposits</p>
                <p className="text-2xl font-bold text-green-600">+{totalDeposits.toLocaleString()} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Withdrawals</p>
                <p className="text-2xl font-bold text-red-600">-{totalWithdrawals.toLocaleString()} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Net Amount</p>
                <p className={`text-2xl font-bold ${netAmount >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {netAmount >= 0 ? "+" : ""}
                  {netAmount.toLocaleString()} ETB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-5 w-5" />
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Manage your financial transactions ({transactions.length} total)</CardDescription>
              </div>
            </div>
            <Button asChild>
              <Link href="/pages/user/transaction/addTransaction">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-primary-foreground">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Deposit">Deposits</SelectItem>
                <SelectItem value="Withdrawal">Withdrawals</SelectItem>
                <SelectItem value="Transfer">Transfers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {paginatedTransactions.map((transaction) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="group"
                    >
                      <TableCell>
                        <Badge variant={getTransactionBadgeVariant(transaction.type)}>{transaction.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        <span className={transaction.type === "Deposit" ? "text-green-600" : "text-red-600"}>
                          {transaction.type === "Deposit" ? "+" : "-"}
                          {transaction.amount.toLocaleString()} ETB
                        </span>
                      </TableCell>
                      <TableCell className="max-w-32 truncate">{transaction.account?.title}</TableCell>
                      <TableCell className="max-w-32 truncate">{transaction.description}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                            className="h-8 w-8 p-0 cursor-pointer btn-action-hover"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            className="h-8 w-8 p-0 text-destructive cursor-pointer btn-delete-hover"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
