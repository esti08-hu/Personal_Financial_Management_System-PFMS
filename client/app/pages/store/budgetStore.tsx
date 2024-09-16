import { create } from "zustand";
import axios from "axios";

type Budget = {
  id: string;
  userId: string;
  title: string;
  type: string;
  amount: string;
  date: string;
};

interface budgetState {
  budget: Budget[];
  setBudget: (budget: Budget) => Promise<void>;
  editBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  fetchBudget: () => Promise<void>;
}

export const useBudgetStore = create<budgetState>((set) => ({
  budget: [],

  setBudget: async (budget) => {
    try {
      const userId = localStorage.getItem("userId"); // Get userId from localStorage
      if (!userId) {
        throw new Error("userId is not defined");
      }

      const budgetWithUserId = { ...budget, userId };
      // console.log("Sending budget data:", budgetWithUserId);

      const response = await axios.post(
        "http://localhost:4000/api/budgets/set-budget",
        budgetWithUserId
      );
      // console.log("Budget response:", response.data);

      alert("Budget added successfully");

      set((state) => ({
        budget: [...state.budget, response.data],
      }));
    } catch (error) {
      console.error("Failed to add budget", error);
    }
  },

  editBudget: async (budget) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/budgets/${budget.id}`,
        budget
      );
      // console.log("Edit budget response:", response.data);

      set((state) => ({
        budget: state.budget.map((t) =>
          t.id === budget.id ? response.data : t
        ),
      }));
      alert("budget edited successfully");
    } catch (error) {
      console.error("Failed to edit budget", error);
    }
  },

  deleteBudget: async (id: string) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this budget?"
      );
      if (confirmDelete) {
        await axios.delete(`http://localhost:4000/api/budgets/${id}`);
        set((state) => ({
          budget: state.budget.filter((t) => t.id !== id),
        }));
        alert("Budget deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete budget", error);
    }
  },

  fetchBudget: async () => {
    try {
      const userId = localStorage.getItem("userId"); // Get userId from localStorage
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        throw new Error("User not authenticated");
      }

      const response = await axios.get<{ budgets: Budget[] }>(
        `http://localhost:4000/api/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      set({ budget: response.data.budgets });
      // console.log("Budget data:", response.data);
    } catch (error) {
      console.error("Failed to fetch budget", error);
    }
  },
}));
