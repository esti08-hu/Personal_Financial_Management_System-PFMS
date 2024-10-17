import { create } from "zustand";
import apiClient from "@/app/lib/axiosConfig";
import { toast } from "react-toastify";

interface ReportData {
  income: number;
  expense: number;
  saved: number;
  savingRate: number;
}

interface ReportStore {
  loading: boolean;
  data: ReportData | null;
  error: string | null;
  fetchData: () => Promise<void>;
}

export const useReportStore = create<ReportStore>((set) => ({
  data: null,
  loading: true,
  error: null,

  fetchData: async () => {
    try {
      set({ loading: true, error: null });
      const userIdResponse = await apiClient.get("/user/userId");
      const userId = userIdResponse.data;

      const expenceResponse = await apiClient.get(
        `/transaction/expense/${userId}`
      );
      const incomeResponse = await apiClient.get(
        `/transaction/income/${userId}`
      );

      // Calculate the report data from transactions
      const income = incomeResponse.data;

      const expense = expenceResponse.data;

      const saved = income - expense;
      const savingRate = (saved / income) * 100;

      set({
        data: {
          income,
          expense,
          saved,
          savingRate,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch History", error);
      set({ error: "Error fetching History" });
      toast.error("Failed to fetch History");
    }
  },
}));
