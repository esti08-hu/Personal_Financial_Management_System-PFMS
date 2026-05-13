"use client";

import apiClient from "@/app/lib/axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { message, Modal } from "antd";
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
    const { account, ...transactionData } = transaction;

    try {
      const response = await apiClient.put(
        `/transaction/${transaction.id}`,
        transactionData
      );

      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === transaction.id ? response.data : t
        ),
      }));

      toast.success("Transaction edited successfully");
    } catch (error) {
      console.error("Failed to edit transaction", error);
      toast.error("Failed to edit transaction");
    }
  },

  deleteTransaction: async (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this transaction?",
      content: "This action cannot be undone.",
      okText: "Yes, delete",
      okType: "danger",
      cancelText: "No, cancel",
      async onOk() {
        try {
          await apiClient.delete(`/transaction/${id}`);

          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
          }));

          message.success("Transaction deleted successfully");
        } catch (error) {
          message.error("An error occurred while deleting the transaction.");
          console.error("Delete Transaction Error:", error);
        }
      },
    });
  },

  fetchTransactions: async () => {
    try {
      const userId = await getStoredUserId()
      const response = await apiClient.get(`/transaction/user/${userId}`)
      set({ transactions: response.data })
    } catch (error) {
      console.error("Failed to fetch transactions", error)
      toast.error("Failed to fetch transactions")
    }
  },
}));
