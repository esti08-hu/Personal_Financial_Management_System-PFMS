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
    id: 0,
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

  const handleDelete = async (id: number) => {
    await deleteBudget(id)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    await editBudget(editBudgetData)
    await fetchBudget()
    setIsEditing(false)
    setEditBudgetData({
      id: 0,
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <div>
              <CardTitle>Budget Management</CardTitle>
              <CardDescription>
                Manage and track your budget allocations ({budget.length} total budgets)
              </CardDescription>
            </div>
          </div>
          <Button asChild>
            <Link href="/pages/user/budget/setBudget">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {paginatedBudgets.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="contents"
                  >
                    <TableRow className="group">
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.type === "Deposit" ? "default" : item.type === "Withdrawal" ? "destructive" : "secondary"
                          }
                        >
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        <span className={item.type === "Deposit" ? "text-green-600" : "text-red-600"}>
                          {item.type === "Deposit" ? "+" : "-"}
                          {item.amount.toLocaleString()} ETB
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </motion.div>
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
