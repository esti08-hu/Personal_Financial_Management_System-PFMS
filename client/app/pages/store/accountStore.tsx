import { create } from "zustand";
import apiClient from "@/app/lib/axiosConfig";
import { toast } from "sonner";
import { getStoredUserId } from "@/app/pages/store/authStore";
import type { EditAccount, NewAccount } from "@/app/types/acc";

type Account = {
  id: string;
  userId: string;
  type: string;
  balance: number;
  title: string;
  createdAt: string;
};

interface AccountState {
  accounts: Account[];
  addAccount: (account: NewAccount) => Promise<void>;
  editAccount: (account: EditAccount) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  fetchAccounts: () => Promise<void>;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],

  addAccount: async (account) => {
    try {
      const userId = await getStoredUserId()
      const accountWithUserId = { ...account, userId }

      const response = await apiClient.post(
        "/account/add-account",
        accountWithUserId,
      )

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
      const payload = {
        title: account.title,
        type: account.type,
        balance: Number(account.balance),
        date: new Date(account.createdAt).toISOString()
      };
      const response = await apiClient.put(`/account/${account.id}`, payload);
      toast.success("Account edited successfully");
    } catch (error) {
      console.error("Failed to edit account", error);
      toast.error("Failed to edit account");
    }
  },

  deleteAccount: async (id: string) => {
    if (window.confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
      try {
        await apiClient.delete(`/account/${id}`);
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        }));
        toast.success("Account deleted successfully");
      } catch (error) {
        console.error("Failed to delete account", error);
        toast.error("Failed to delete account");
      }
    }
  },

  fetchAccounts: async () => {
    try {
      const userId = await getStoredUserId()
      const response = await apiClient.get(`/account/${userId}`)
      set({ accounts: Array.isArray(response.data) ? response.data : response.data?.items || response.data?.data || [] })
    } catch (error) {
      console.error("Failed to fetch Accounts", error)
      toast.error("Failed to fetch accounts")
    }
  },
}));
