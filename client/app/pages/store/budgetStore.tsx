import { create } from "zustand";
import axios from "axios";
import apiClient from "@/app/lib/axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      const userIdResponse = await apiClient.get("user/userId");

      const userId = userIdResponse.data;

      const budgetWithUserId = { ...budget, userId };

      const response = await apiClient.post(
        "/budget/set-budget",
        budgetWithUserId
      );

      toast.success("Budget added successfully");

      set((state) => ({
        budget: [...state.budget, response.data],
      }));
    } catch (error) {
      console.error("Failed to add budget", error);
      toast.error("Failed to add budget");
    }
  },

  editBudget: async (budget) => {
    try {
      const response = await apiClient.put(`/budget/${budget.id}`, budget);

      set((state) => ({
        budget: state.budget.map((t) =>
          t.id === budget.id ? response.data : t
        ),
      }));

      toast.success("Budget edited successfully");
    } catch (error) {
      console.error("Failed to edit budget", error);
      toast.error("Failed to edit budget");
    }
  },

  deleteBudget: async (id: string) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this budget?"
      );
      if (confirmDelete) {
        await apiClient.delete(`/budget/${id}`);
        set((state) => ({
          budget: state.budget.filter((t) => t.id !== id),
        }));
        toast.success("Budget deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete budget", error);
      toast.error("Failed to delete budget");
    }
  },

  fetchBudget: async () => {
    try {
      const userIdResponse = await apiClient.get("/user/userId");
      const userId = userIdResponse.data;

      const response = await apiClient.get(`/budget/${userId}`);
      set({ budget: response.data });
    } catch (error) {
      console.error("Failed to fetch budget", error);
      toast.error("Failed to fetch budgets");
    }
  },
}));
