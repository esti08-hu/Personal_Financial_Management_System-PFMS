import { create } from "zustand";
import axios from "axios";

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
      const userId = localStorage.getItem("userId"); // Get userId from localStorage
      if (!userId) {
        throw new Error("userId is not defined");
      }

      const accountWithUserId = { ...account, userId };
      // console.log("Sending Account data:", accountWithUserId);

      const response = await axios.post(
        "http://localhost:4000/api/accounts/add-account",
        accountWithUserId
      );
      // console.log("Account response:", response.data);

      alert("Account added successfully");

      set((state) => ({
        accounts: [...state.accounts, response.data],
      }));
    } catch (error) {
      console.error("Failed to add Account", error);
    }
  },

  editAccount: async (account) => {
    // console.log("Edit account data:", account)
    try {
      const response = await axios.put(
        `http://localhost:4000/api/accounts/${account.id}`,
        account
      );
      // console.log("Edit account response:", response.data);

      set((state) => ({
        accounts: state.accounts.map((a) =>
          a.id === account.id ? response.data : a
        ),
      }));
      alert("Account edited successfully");
    } catch (error) {
      console.error("Failed to edit account", error);
    }
  },

  deleteAccount: async (id: string) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this Account?"
      );
      if (confirmDelete) {
        await axios.delete(`http://localhost:4000/api/accounts/${id}`);
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        }));
        alert("Account deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete account", error);
    }
  },

  fetchAccounts: async () => {
    try {
      const userId = localStorage.getItem("userId"); // Get userId from localStorage
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        throw new Error("User not authenticated");
      }

      // console.log(userId, token)

      const response = await axios.get<{ accounts: Account[] }>(
        `http://localhost:4000/api/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      set({ accounts: response.data.accounts });
      // console.log("Accounts fetched successfully", response.data.accounts);
    } catch (error) {
      console.error("Failed to fetch Accounts", error);
    }
  },
}));
