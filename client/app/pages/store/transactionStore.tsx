import { create } from "zustand";
import axios from "axios";
import apiClient from "@/app/lib/axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Transaction = {
  id: string;
  userId: string;
  type: string;
  amount: string;
  date: string;
  description: string;
};

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction, userId: string) => Promise<void>;
  editTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchTransactions: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],

  addTransaction: async (transaction) => {
    try {
      const userIdResponse = await apiClient.get("/user/userId");
      
      const userId = userIdResponse.data;

      const transactionWithUserId = { ...transaction, userId };

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
      const response = await apiClient.put(
        `/transaction/${transaction.id}`,
        transaction
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
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this transaction?"
      );
      if (confirmDelete) {
        await apiClient.delete(`/transaction/${id}`);
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
        toast.success("Transaction deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete transaction", error);
      toast.error("Failed to delete transaction");
    }
  },

  fetchTransactions: async () => {
    try {
      const userIdResponse = await apiClient.get("/user/userId");
      const userId = userIdResponse.data;
      console.log(userId)
      
      const response = await apiClient.get(
        `/transaction/${userId}`
      );
      set({ transactions: response.data });
    } catch (error) {
      console.error("Failed to fetch transactions", error);
      toast.error("Failed to fetch transactions");
    }
  },
}));
