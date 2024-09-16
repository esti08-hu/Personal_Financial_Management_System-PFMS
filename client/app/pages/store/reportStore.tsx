import create from "zustand";
import axios from "axios";

type Transaction = {
  id: string;
  data: ReportData | null;
  loading: boolean;
  userId: string;
  type: string;
  amount: number; // Change to number type
  date: string;
  description: string;
};

interface ReportData {
  income: number;
  expense: number;
  saved: number;
}

interface ReportStore {
  loading: boolean;
  data: ReportData | null;
  error: string | null;
  transactions: Transaction[];
  fetchData: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
}

export const useReportStore = create<ReportStore>((set) => ({
  data: null,
  loading: true,
  error: null,
  transactions: [],
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("http://localhost:4000/api/report");
      set({ data: response.data, loading: false });
    } catch (error) {
      set({ error: "Error fetching report data", loading: false });
    }
  },
  fetchTransactions: async () => {
    try {
      const userId = localStorage.getItem("userId");
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

      const transactions = response.data.transactions;
      set({ transactions });

      // Calculate the report data from transactions
      const income = transactions
        .filter((transaction) => transaction.type === "Income")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const expense = transactions
        .filter((transaction) => transaction.type === "Expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      // const saved = transactions
      //   .filter((transaction) => transaction.type === "Saved")
      //   .reduce((sum, transaction) => sum + transaction.amount, 0);
      const saved = income - expense;

      set({
        transactions,
        data: {
          income,
          expense,
          saved,
        },
        loading: false,
      });
      // console.log(income, expense, saved);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
      set({ error: "Error fetching transactions" });
    }
  },
}));
