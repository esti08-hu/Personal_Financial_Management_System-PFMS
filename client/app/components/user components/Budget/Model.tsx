"use client"

import type React from "react"

// import "flowbite";
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Calendar, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react"

type ModelProps = {
  isEditing: boolean
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  handleUpdate: (e: React.FormEvent<HTMLFormElement>) => void
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  editBudgetData: {
    id: number
    createdAt: string
    type: string
    amount: number
    title: string
  }
}

const Model: React.FC<ModelProps> = ({ isEditing, setIsEditing, handleUpdate, handleChange, editBudgetData }) => {
  const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(true)
  const [originalData, setOriginalData] = useState(editBudgetData)

  const checkIfFormChanged = () => {
    const hasChanged =
      editBudgetData.amount !== originalData.amount ||
      editBudgetData.title !== originalData.title ||
      editBudgetData.type !== originalData.type ||
      editBudgetData.createdAt !== originalData.createdAt

    setIsSaveDisabled(!hasChanged)
  }

  useEffect(() => {
    checkIfFormChanged()
  }, [editBudgetData])

  if (!isEditing) return null

  const getBudgetIcon = (type: string) => {
    switch (type) {
      case "Deposit":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "Withdrawal":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "Transfer":
        return <ArrowUpDown className="h-4 w-4 text-blue-600" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={isEditing} onOpenChange={setIsEditing}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Edit Budget
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-6">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getBudgetIcon(editBudgetData.type)}
                  <span className="font-medium">{editBudgetData.title || "Budget Item"}</span>
                </div>
                <Badge variant="outline" className="font-mono">
                  {editBudgetData.amount.toLocaleString()} ETB
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Budget Title</Label>
              <Input
                id="title"
                name="title"
                value={editBudgetData.title}
                onChange={handleChange}
                placeholder="Enter budget title"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Budget Type</Label>
              <Select
                value={editBudgetData.type}
                onValueChange={(value) => handleChange({ target: { name: "type", value } } as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Deposit">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium">Income Budget</div>
                        <div className="text-xs text-muted-foreground">Expected income or deposits</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Withdrawal">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <div>
                        <div className="font-medium">Expense Budget</div>
                        <div className="text-xs text-muted-foreground">Planned expenses or withdrawals</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Transfer">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium">Transfer Budget</div>
                        <div className="text-xs text-muted-foreground">Planned transfers between accounts</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Budget Amount</Label>
              <div className="relative">
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={editBudgetData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="font-mono pr-12"
                  min={0}
                  step="0.01"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">ETB</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Budget Date
              </Label>
              <Input
                id="date"
                name="createdAt"
                type="date"
                value={new Date(editBudgetData.createdAt).toLocaleDateString("en-CA")}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaveDisabled} className="flex-1">
              {isSaveDisabled ? "No Changes" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default Model
