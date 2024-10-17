import { create } from "zustand";
import apiClient from "@/app/lib/axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { message, Modal } from "antd";
import type { EditBudget, NewBudget } from "@/app/types/acc";

type Budget = {
  id: number;
  userId: number;
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
  deleteBudget: (id: number) => Promise<void>;
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

  deleteBudget: async (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this budget?",
      content: "This action cannot be undone.",
      okText: "Yes, delete",
      okType: "danger",
      cancelText: "No, cancel",
      async onOk() {
        try {
          await apiClient.delete(`/budget/${id}`);
          set((state) => ({
            budget: state.budget.filter((t) => t.id !== id),
          }));
          toast.success("Budget deleted successfully");
        } catch (error) {
          console.error("Failed to delete budget", error);
          message.error("Failed to delete budget");
        }
      },
    });
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
