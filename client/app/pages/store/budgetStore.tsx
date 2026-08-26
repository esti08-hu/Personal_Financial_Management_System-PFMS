import { create } from "zustand";
import apiClient from "@/app/lib/axiosConfig";
import { toast } from "sonner";
import { getStoredUserId } from "@/app/pages/store/authStore";
import type { EditBudget, NewBudget } from "@/app/types/acc";

type Budget = {
  id: string;
  userId: string;
  title: string;
  type: string;
  date: string;
  amount: number;
  createdAt: string;
};

interface budgetState {
  budget: Budget[];
  setBudget: (budget: NewBudget) => Promise<void>;
  editBudget: (budget: EditBudget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  fetchBudget: () => Promise<void>;
}

export const useBudgetStore = create<budgetState>((set) => ({
  budget: [],

  setBudget: async (budget) => {
    try {
      const userId = await getStoredUserId()
      const budgetWithUserId = { ...budget, userId }

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
      const payload = {
        title: budget.title,
        type: budget.type,
        amount: Number(budget.amount),
        date: new Date(budget.createdAt).toISOString()
      };
      const response = await apiClient.put(`/budget/${budget.id}`, payload);
      toast.success("Budget edited successfully");
    } catch (error) {
      console.error("Failed to edit budget", error);
      toast.error("Failed to edit budget");
    }
  },

  deleteBudget: async (id: string) => {
    if (window.confirm("Are you sure you want to delete this budget? This action cannot be undone.")) {
      try {
        await apiClient.delete(`/budget/${id}`);
        set((state) => ({
          budget: state.budget.filter((t) => t.id !== id),
        }));
        toast.success("Budget deleted successfully");
      } catch (error) {
        console.error("Failed to delete budget", error);
        toast.error("Failed to delete budget");
      }
    }
  },

  fetchBudget: async () => {
    try {
      const userId = await getStoredUserId()
      const response = await apiClient.get(`/budget/${userId}`)
      set({ budget: Array.isArray(response.data) ? response.data : response.data?.items || response.data?.data || [] })
    } catch (error) {
      console.error("Failed to fetch budget", error)
      toast.error("Failed to fetch budgets")
    }
  },
}));
