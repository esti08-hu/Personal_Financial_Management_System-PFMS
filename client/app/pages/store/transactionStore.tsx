import { create } from "zustand";
import axios from "axios";

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
  addTransaction: (transaction: Transaction) => Promise<void>;
  editTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchTransactions: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],

  addTransaction: async (transaction) => {
    try {
      const userId = localStorage.getItem("userId"); // Get userId from localStorage
      if (!userId) {
        throw new Error("userId is not defined");
      }

      const transactionWithUserId = { ...transaction, userId };
    //  console.log ("Sending transaction data:", transactionWithUserId);

      const response = await axios.post(
        "http://localhost:4000/api/transactions/add-transaction",
        transactionWithUserId
      );
      // console.log("Transaction response:", response.data);

      alert("Transaction added successfully");

      set((state) => ({
        transactions: [...state.transactions, response.data],
      }));
    } catch (error) {
      console.error("Failed to add transaction", error);
    }
  },

  editTransaction: async (transaction) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/transactions/${transaction.id}`,
        transaction
      );
      // console.log("Edit transaction response:", response.data);

      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === transaction.id ? response.data : t
        ),
      }));
      // console.log(transaction)
      alert("Transaction edited successfully");
    } catch (error) {
      console.error("Failed to edit transaction", error);
    }
  },

  deleteTransaction: async (id: string) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this transaction?"
      );
      if (confirmDelete) {
        await axios.delete(`http://localhost:4000/api/transactions/${id}`);
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
        alert("Transaction deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete transaction", error);
    }
  },

  fetchTransactions: async () => {
    try {
      const userId = localStorage.getItem("userId"); // Get userId from localStorage
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        throw new Error("User not authenticated");
      }

      const response = await axios.get<{ transactions: Transaction[] }>(
        `http://localhost:4000/api/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      set({ transactions: response.data.transactions });
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    }
  },
}));
