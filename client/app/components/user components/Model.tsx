"use client"

import type React from "react"

import apiClient from "@/app/lib/axiosConfig"
import type { Account, EditTransaction } from "@/app/types/acc"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Wallet, Calendar, DollarSign } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type ModelProps = {
  isEditing: boolean
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  handleUpdate: (e: React.FormEvent<HTMLFormElement>) => void
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  editTransactionData: EditTransaction
}

const Model: React.FC<ModelProps> = ({ isEditing, setIsEditing, handleUpdate, handleChange, editTransactionData }) => {
  const [accountId, setAccountId] = useState<number>(editTransactionData.account.id)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [error, setError] = useState<string>("")
  const [originalAmount, setOriginalAmount] = useState<number>(editTransactionData.amount)
  const [originalData, setOriginalData] = useState(editTransactionData)
  const [originalType, setOriginalType] = useState<string>(String(editTransactionData.type))
  const [newBalance, setNewBalance] = useState(Number(editTransactionData.account.balance))
  const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(true)

  const fetchAccounts = async (userId: number) => {
    try {
      const response = await apiClient.get(`/account/${userId}`)
      const data = response.data
      setAccounts(data)
    } catch (error) {
      console.error("Failed to fetch accounts", error)
      toast.error("Failed to fetch accounts")
      setAccounts([])
    }
  }

  // Helper function to calculate the new balance based on transaction type and amount
  const calculateNewBalance = (newType: string, newAmount: number) => {
    const selectedAccount = accounts.find((acc) => acc.id === accountId)

    if (selectedAccount) {
      let updatedBalance = selectedAccount.balance

      if (newType === "Deposit") {
        updatedBalance += newAmount
      } else if (newType === "Withdrawal" || newType === "Transfer") {
        updatedBalance -= newAmount
        if (updatedBalance < 0) {
          setError("Amount exceeds account balance")
          return
        }
      }
      setNewBalance(updatedBalance)
      setError("")
    }
  }

  // Handle changes in transaction type
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value
    const newAmount = Number(editTransactionData.amount)

    handleChange(e)
    calculateNewBalance(newType, newAmount)
  }

  // Handle changes in the transaction amount
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = Number(e.target.value)
    const newType = editTransactionData.type

    handleChange(e)
    calculateNewBalance(newType, newAmount)
  }

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAccountId = Number(e.target.value)
    setAccountId(Number(e.target.value))
    const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId)

    if (selectedAccount) {
      handleChange({
        ...e,
        target: {
          ...e.target,
          name: "accountId",
          value: selectedAccount.id.toString(),
        },
      })

      setNewBalance(selectedAccount.balance)
    }
  }

  useEffect(() => {
    const fetchUserIdAndAccounts = async () => {
      try {
        const userIdResponse = await apiClient.get("/user/userId")
        const userId = userIdResponse.data
        fetchAccounts(userId)
      } catch (error) {
        console.error("Failed to fetch user ID", error)
        toast.error("Failed to fetch user ID")
      }
    }

    fetchUserIdAndAccounts()
  }, [])

  const checkIfFormChanged = () => {
    const hasChanged =
      accountId !== originalData.account.id ||
      Number(editTransactionData.amount) !== originalData.amount ||
      editTransactionData.type !== originalData.type ||
      editTransactionData.createdAt !== originalData.createdAt ||
      editTransactionData.description !== originalData.description

    // Enable or disable the Save button based on changes
    setIsSaveDisabled(!hasChanged)
  }

  useEffect(() => {
    checkIfFormChanged()
  }, [accountId, editTransactionData])

  if (!isEditing) return null

  return (
    <Dialog open={isEditing} onOpenChange={setIsEditing}>
      <DialogContent className="sm:max-w-md border shadow-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <DollarSign className="h-5 w-5 text-primary" />
            Edit Transaction
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Current Balance</span>
                </div>
                <Badge variant="secondary" className="font-mono bg-primary/10 text-primary border-primary/20">
                  {newBalance.toLocaleString()} ETB
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-foreground font-medium">
                Transaction Type
              </Label>
              <Select
                value={editTransactionData.type}
                onValueChange={(value) => handleTypeChange({ target: { name: "type", value } } as any)}
              >
                <SelectTrigger className="border-input">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent className="border shadow-md bg-primary-foreground">
                  <SelectItem value="Deposit" className="hover:bg-muted">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Deposit
                    </div>
                  </SelectItem>
                  <SelectItem value="Withdrawal" className="hover:bg-muted">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Withdrawal
                    </div>
                  </SelectItem>
                  <SelectItem value="Transfer" className="hover:bg-muted">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Transfer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId" className="text-foreground font-medium">
                Account
              </Label>
              <Select
                value={accountId.toString()}
                onValueChange={(value) => handleAccountChange({ target: { name: "accountId", value } } as any)}
              >
                <SelectTrigger className="border-input">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent className="border shadow-md bg-primary-foreground">
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id.toString()} className="hover:bg-muted">
                      <div className="flex items-center justify-between w-full">
                        <span>{acc.title}</span>
                        <Badge variant="outline" className="ml-2 font-mono text-xs bg-muted/50">
                          {acc.balance.toLocaleString()} ETB
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground font-medium">
                Amount (ETB)
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min={1}
                value={editTransactionData.amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                className="font-mono border-input"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2 text-foreground font-medium">
                <Calendar className="h-4 w-4 text-primary" />
                Transaction Date
              </Label>
              <Input
                id="date"
                name="createdAt"
                type="date"
                value={new Date(editTransactionData.createdAt).toISOString().split("T")[0]}
                onChange={handleChange}
                className="border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={editTransactionData.description}
                onChange={handleChange}
                placeholder="Enter transaction description"
                minLength={2}
                rows={3}
                className="border-input resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="flex-1 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaveDisabled || !!error}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isSaveDisabled ? "No Changes" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default Model
