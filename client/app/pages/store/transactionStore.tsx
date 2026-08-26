"use client";

import apiClient from "@/app/lib/axiosConfig";
import { toast } from "sonner";
import { getStoredUserId } from "@/app/pages/store/authStore";
import type {
  EditTransaction,
  NewTransaction,
  Transaction,
} from "@/app/types/acc";
import { create } from "zustand";

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: NewTransaction) => Promise<void>;
  editTransaction: (transaction: EditTransaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchTransactions: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],

  addTransaction: async (transaction) => {
    try {
      const userId = await getStoredUserId()
      const transactionWithUserId = { ...transaction, userId }

      const response = await apiClient.post(
        "/transaction/add-transaction",
        transactionWithUserId
      );

      toast.success("Transaction added successfully");

      set((state) => ({
        transactions: [...state.transactions, response.data],
      }));
    } catch (error) {
      console.error("Failed to add transaction", error);
      toast.error("Failed to add transaction");
    }
  },

  editTransaction: async (transaction) => {
    try {
      const payload = {
        type: transaction.type,
        accountId: transaction.account?.id || (transaction as any).accountId,
        amount: Number(transaction.amount),
        createdAt: new Date(transaction.createdAt).toISOString(),
        description: transaction.description,
        balance: Number((transaction as any).balance || transaction.account?.balance || 0),
      };

      const response = await apiClient.put(
        `/transaction/${transaction.id}`,
        payload
      );
      toast.success("Transaction edited successfully");
    } catch (error) {
      console.error("Failed to edit transaction", error);
      toast.error("Failed to edit transaction");
    }
  },

  deleteTransaction: async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      try {
        await apiClient.delete(`/transaction/${id}`);

        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));

        toast.success("Transaction deleted successfully");
      } catch (error) {
        toast.error("An error occurred while deleting the transaction.");
        console.error("Delete Transaction Error:", error);
      }
    }
  },

  fetchTransactions: async () => {
    try {
      const userId = await getStoredUserId()
      const response = await apiClient.get(`/transaction/user/${userId}`)
      set({ transactions: Array.isArray(response.data) ? response.data : response.data?.items || response.data?.data || [] })
    } catch (error) {
      console.error("Failed to fetch transactions", error)
      toast.error("Failed to fetch transactions")
    }
  },
}));
