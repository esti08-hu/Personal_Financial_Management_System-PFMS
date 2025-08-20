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
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { accounts, fetchAccounts, editAccount, deleteAccount } = useAccountStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const [editAccountData, setEditAccountData] = useState<EditAccount>({
    id: 0,
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

  const handleDelete = async (id: number) => {
    await deleteAccount(id)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    await editAccount(editAccountData)
    await fetchAccounts()
    setIsEditing(false)
    setEditAccountData({
      id: 0,
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

  if (!isClient) return null

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
              <p className="text-3xl font-bold">{totalBalance.toLocaleString()} ETB</p>
              <p className="text-sm text-muted-foreground">{accounts.length} accounts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <div>
                <CardTitle>Account Management</CardTitle>
                <CardDescription>Manage your financial accounts ({accounts.length} total)</CardDescription>
              </div>
            </div>
            <Button asChild>
              <Link href="/pages/user/account/addAccount">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
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
                placeholder="Search accounts..."
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
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Savings">Savings</SelectItem>
                <SelectItem value="Checking">Checking</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAccounts.map((account) => (
                  <motion.tr
                    key={account.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="group"
                  >
                    <TableCell className="font-medium">{account.title}</TableCell>
                    <TableCell>
                      <Badge variant={getAccountBadgeVariant(account.type)}>{account.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      <span className={account.balance >= 0 ? "text-green-600" : "text-red-600"}>
                        {account.balance.toLocaleString()} ETB
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(account)} className="h-8 w-8 p-0">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(account.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
