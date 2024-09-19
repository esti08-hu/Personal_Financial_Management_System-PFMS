import { create } from "zustand";
import axios from "axios";
import apiClient from "@/app/lib/axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Account = {
    id: string;
    userId: string;
    type: string;
    balance: string;
    title: string;
  };
  

interface AccountState {
  accounts: Account[];
  addAccount: (account: Account) => Promise<void>;
  editAccount: (account: Account) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  fetchAccounts: () => Promise<void>;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],

  addAccount: async (account) => {
    try {
      const userIdResponse = await apiClient.get("/user/userId");
      
      const userId = userIdResponse.data;

      const accountWithUserId = { ...account, userId };

      const response = await apiClient.post(
        "/account/add-account",
        accountWithUserId
      );

      toast.success("Account added successfully");

      set((state) => ({
        accounts: [...state.accounts, response.data],
      }));
    } catch (error) {
      console.error("Failed to add Account", error);
      toast.error("Failed to add Account");
    }
  },

  editAccount: async (account) => {
    try {
      const response = await apiClient.put(
        `/account/${account.id}`,
        account
      );
      set((state) => ({
        accounts: state.accounts.map((a) =>
          a.id === account.id ? response.data : a
        ),
      }));
      toast.success("Account edited successfully");
    } catch (error) {
      console.error("Failed to edit account", error);
      toast.error("Failed to edit account");
    }
  },

  deleteAccount: async (id: string) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this Account?"
      );
      if (confirmDelete) {
        await apiClient.delete(`/account/${id}`);
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        }));
        toast.success("Account deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete account", error);
      toast.error("Failed to delete account");
    }
  },

  fetchAccounts: async () => {
    try {
      const userIdResponse = await apiClient.get("/user/userId");
      const userId = userIdResponse.data;
      
      const response = await apiClient.get(
        `/account/${userId}`
      );
      set({ accounts: response.data });
    } catch (error) {
      console.error("Failed to fetch Accounts", error);
      toast.error("Failed to fetch accounts");

    }
  },
}));
