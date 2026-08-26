"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAccountStore } from "@/app/pages/store/accountStore"
import Loader from "@/app/common/Loader"
import { motion } from "framer-motion"
import { Pencil, Trash2, Plus, Search, Filter, Wallet, CreditCard } from "lucide-react"
import type { EditAccount } from "@/app/types/acc"
import Model from "./Model"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ManageAccount = () => {
  const { accounts, fetchAccounts, editAccount, deleteAccount } = useAccountStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const [editAccountData, setEditAccountData] = useState<EditAccount>({
    id: "",
    title: "",
    type: "",
    balance: 0,
    createdAt: "",
  })

  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Filter and search accounts
  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = account.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || account.type === filterType
    return matchesSearch && matchesFilter
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredAccounts.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex)

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await fetchAccounts()
      setIsLoading(false)
    }

    fetchData()
  }, [fetchAccounts])

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterType])

  const handleEdit = (account: EditAccount) => {
    setIsEditing(true)
    setEditAccountData(account)
  }

  const handleDelete = async (id: string) => {
    await deleteAccount(id)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    await editAccount(editAccountData)
    await fetchAccounts()
    setIsEditing(false)
    setEditAccountData({
      id: "",
      type: "",
      createdAt: "",
      title: "",
      balance: 0,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditAccountData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const getAccountBadgeVariant = (type: string) => {
    switch (type) {
      case "Savings":
        return "default"
      case "Checking":
        return "secondary"
      case "Credit":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <CardTitle>Account Management</CardTitle>
          </div>
          <CardDescription>Loading your account information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40 w-full">
            <Loader />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!accounts.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <CardTitle>Account Management</CardTitle>
          </div>
          <CardDescription>Manage your financial accounts and track balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="rounded-full bg-muted p-6">
              <CreditCard className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">No accounts found</h3>
              <p className="text-muted-foreground max-w-md">
                You haven't added any accounts yet. Start by creating your first account to track your finances.
              </p>
            </div>
            <Button asChild className="mt-4">
              <Link href="/pages/user/account/addAccount">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Account
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="glass-surface rounded-3xl border border-sky-400/20 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/10 rounded-full blur-[40px] group-hover:bg-sky-400/20 transition-colors" />
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl shadow-[0_0_15px_rgba(14,165,233,0.15)]">
              <Wallet className="h-8 w-8 text-sky-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Balance</p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-sky-400 dark:from-sky-400 dark:to-sky-200 drop-shadow-sm">{totalBalance.toLocaleString()} <span className="text-xl opacity-70">ETB</span></p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{accounts.length} active accounts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-surface-elevated rounded-3xl border border-sky-400/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),0_0_45px_rgba(125,211,252,0.12)] backdrop-blur-2xl overflow-hidden mt-8">
        <CardHeader className="border-b border-sky-400/10 bg-slate-50/50 dark:bg-[#0a0e1a]/50 py-6 px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.15)]">
                <Wallet className="h-5 w-5 text-sky-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">Account Management</CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage your financial accounts ({accounts.length} total)</CardDescription>
              </div>
            </div>
            <Link href="/pages/user/account/addAccount" className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[0_5px_20px_rgba(14,165,233,0.3)] hover:from-sky-400 hover:to-indigo-400 text-sm font-semibold transition-all">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search accounts..."
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
                <SelectItem value="Savings">Savings</SelectItem>
                <SelectItem value="Checking">Checking</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl border border-sky-400/20 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-sky-400/10 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-[#0a0e1a]/50">
                  <TableHead className="font-semibold px-6 py-4">Title</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Type</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Balance</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Date</TableHead>
                  <TableHead className="text-center font-semibold px-6 py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAccounts.map((account) => (
                  <motion.tr
                    key={account.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="group border-sky-400/10 glass-surface-hover transition-colors"
                  >
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300 px-6 py-4">{account.title}</TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                        account.type === "Savings" 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                          : account.type === "Checking"
                            ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                            : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                      }`}>
                        {account.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold px-6 py-4">
                      <span className={account.balance >= 0 ? "text-emerald-500" : "text-red-500"}>
                        {account.balance >= 0 ? "+" : ""}
                        {account.balance.toLocaleString()} <span className="text-xs font-medium opacity-70">ETB</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 px-6 py-4 font-medium">
                      {new Date(account.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleEdit(account)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 transition-colors cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAccounts.length)} of {filteredAccounts.length}{" "}
                accounts
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8"
                  >
                    {page}
                  </Button>
                ))}
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
          editAccountData={editAccountData}
        />
      )}
    </div>
  )
}

export default ManageAccount
