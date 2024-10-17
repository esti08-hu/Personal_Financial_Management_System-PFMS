import { create } from "zustand";
import apiClient from "@/app/lib/axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { message, Modal } from "antd";
import type { EditAccount, NewAccount } from "@/app/types/acc";

type Account = {
  id: number;
  userId: number;
  type: string;
  balance: number;
  title: string;
  createdAt: string;
};

interface AccountState {
  accounts: Account[];
  addAccount: (account: NewAccount) => Promise<void>;
  editAccount: (account: EditAccount) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
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
      const response = await apiClient.put(`/account/${account.id}`, account);
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

  deleteAccount: async (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this account?",
      content: "This action cannot be undone.",
      okText: "Yes, delete",
      okType: "danger",
      cancelText: "No, cancel",
      async onOk() {
        try {
          await apiClient.delete(`/account/${id}`);
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        }));
        message.success("Account deleted successfully");

        } catch (error) {
          console.error("Failed to delete account", error);
          message.error("Failed to delete account");
        }
      },
    });

  },

  fetchAccounts: async () => {
    try {
      const userIdResponse = await apiClient.get("/user/userId");
      const userId = userIdResponse.data;

      const response = await apiClient.get(`/account/${userId}`);
      console.log(response.data);
      set({ accounts: response.data });
    } catch (error) {
      console.error("Failed to fetch Accounts", error);
      toast.error("Failed to fetch accounts");
    }
  },
}));
