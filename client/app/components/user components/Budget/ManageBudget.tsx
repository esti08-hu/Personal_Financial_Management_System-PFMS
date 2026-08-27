"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Model from "./Model"
import { useBudgetStore } from "@/app/pages/store/budgetStore"
import Loader from "@/app/common/Loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Plus, Calendar, DollarSign, Target } from "lucide-react"
import type { EditBudget } from "@/app/types/acc"

const ManageBudget = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { budget, fetchBudget, editBudget, deleteBudget } = useBudgetStore()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editBudgetData, setEditBudgetData] = useState<EditBudget>({
    id: "",
    createdAt: "",
    type: "",
    amount: 0,
    title: "",
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Calculate the start and end index for slicing the users array
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedBudgets = budget.slice(startIndex, endIndex)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await fetchBudget()
      setIsLoading(false)
    }

    fetchData()
  }, [fetchBudget])

  const handleEdit = (budget: EditBudget) => {
    setIsEditing(true)
    setEditBudgetData(budget)
  }

  const handleDelete = async (id: string) => {
    await deleteBudget(id)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    await editBudget(editBudgetData)
    await fetchBudget()
    setIsEditing(false)
    setEditBudgetData({
      id: "",
      createdAt: "",
      type: "",
      amount: 0,
      title: "",
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditBudgetData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <CardTitle>Budget Management</CardTitle>
          </div>
          <CardDescription>Loading your budget information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40 w-full">
            <Loader />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!budget || budget.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <CardTitle>Budget Management</CardTitle>
          </div>
          <CardDescription>Manage and track your budget allocations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="rounded-full bg-muted p-6">
              <DollarSign className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">No budgets found</h3>
              <p className="text-muted-foreground max-w-md">
                You haven't created any budgets yet. Start by setting up your first budget to track your financial
                goals.
              </p>
            </div>
            <Button asChild className="mt-4">
              <Link href="/pages/user/budget/setBudget">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalPages = Math.ceil(budget.length / pageSize)

  return (
    <Card className="glass-surface-elevated rounded-3xl border border-sky-400/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),0_0_45px_rgba(125,211,252,0.12)] backdrop-blur-2xl overflow-hidden mt-8">
      <CardHeader className="border-b border-sky-400/10 bg-slate-50/50 dark:bg-[#0a0e1a]/50 py-6 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.15)]">
              <Target className="h-5 w-5 text-sky-500" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">Budget Management</CardTitle>
              <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Manage and track your budget allocations ({budget.length} total budgets)
              </CardDescription>
            </div>
          </div>
          <Link href="/pages/user/budget/setBudget" className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[0_5px_20px_rgba(14,165,233,0.3)] hover:from-sky-400 hover:to-indigo-400 text-sm font-semibold transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="rounded-2xl border border-sky-400/20 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-sky-400/10 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-[#0a0e1a]/50">
                <TableHead className="font-semibold px-6 py-4">Title</TableHead>
                <TableHead className="font-semibold px-6 py-4">Type</TableHead>
                <TableHead className="font-semibold px-6 py-4">Amount</TableHead>
                <TableHead className="font-semibold px-6 py-4">Date</TableHead>
                <TableHead className="text-center font-semibold px-6 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {paginatedBudgets.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="group border-sky-400/10 glass-surface-hover transition-colors"
                  >
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300 px-6 py-4">{item.title}</TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                        item.type === "Deposit" 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                          : item.type === "Withdrawal"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                            : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                      }`}>
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold px-6 py-4">
                      <span className={item.type === "Deposit" ? "text-emerald-500" : "text-red-500"}>
                        {item.type === "Deposit" ? "+" : "-"}
                        {item.amount.toLocaleString()} <span className="text-xs font-medium opacity-70">ETB</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 px-6 py-4 font-medium">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-sky-500" />
                        <span>{new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
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
              Showing {startIndex + 1} to {Math.min(endIndex, budget.length)} of {budget.length} budgets
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8"
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {isEditing && (
          <Model
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleUpdate={handleUpdate}
            handleChange={handleChange}
            editBudgetData={editBudgetData}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default ManageBudget
