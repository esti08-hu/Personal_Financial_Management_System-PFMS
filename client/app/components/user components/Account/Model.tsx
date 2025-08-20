"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Calendar, CreditCard, Banknote, Building } from "lucide-react"

type ModelProps = {
  isEditing: boolean
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  handleUpdate: (e: React.FormEvent<HTMLFormElement>) => void
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  editAccountData: {
    id: number
    type: string
    balance: number
    title: string
    createdAt: string
  }
}

const Model: React.FC<ModelProps> = ({ isEditing, setIsEditing, handleUpdate, handleChange, editAccountData }) => {
  if (!isEditing) return null

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "Saving":
        return <Banknote className="h-4 w-4" />
      case "Checking":
        return <CreditCard className="h-4 w-4" />
      case "Business":
        return <Building className="h-4 w-4" />
      default:
        return <Wallet className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={isEditing} onOpenChange={setIsEditing}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Edit Account
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-6">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getAccountIcon(editAccountData.type)}
                  <span className="font-medium">{editAccountData.title || "Account Name"}</span>
                </div>
                <Badge variant="outline" className="font-mono">
                  {editAccountData.balance.toLocaleString()} ETB
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Account Type</Label>
              <Select
                value={editAccountData.type}
                onValueChange={(value) => handleChange({ target: { name: "type", value } } as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Saving">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Savings Account</div>
                        <div className="text-xs text-muted-foreground">For long-term savings</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Checking">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Checking Account</div>
                        <div className="text-xs text-muted-foreground">For daily transactions</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Business">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Business Account</div>
                        <div className="text-xs text-muted-foreground">For business operations</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">Account Balance</Label>
              <div className="relative">
                <Input
                  id="balance"
                  name="balance"
                  type="number"
                  value={editAccountData.balance}
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
              <Label htmlFor="title">Account Name</Label>
              <Input
                id="title"
                name="title"
                value={editAccountData.title}
                onChange={handleChange}
                placeholder="Enter account name"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Account Created Date
              </Label>
              <Input
                id="date"
                name="createdAt"
                type="date"
                value={new Date(editAccountData.createdAt).toLocaleDateString("en-CA")}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default Model
