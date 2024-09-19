"use client";
import * as React from "react";
import { useEffect } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { useReportStore } from "../../store/reportStore";
import Loader from "../../../components/admin components/common/Loader";

const Report = () => {
  const { data, loading, error, fetchData } = useReportStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 w-4/5">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-2xl font-semibold text-red">{error}</div>
        
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-2xl font-semibold text-red">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="container h-full">
      <h1 className="text-xl font-bold text-[#22577A] mb-5">Report</h1>
      <hr className="h-1 bg-gray-400 w-full" />
      <div>
        <h3 className="text-[#22577A] mt-5 font-bold mb-10">
          Income/Expense Chart for current month :
        </h3>
      </div>
      <div className="flex justify-center">
        <PieChart
          series={[
            {
              data: [
                { id: 0, value: data.income, label: "Income" },
                { id: 1, value: data.expense, label: "Expense" },
                { id: 2, value: data.saved, label: "Saved" },
              ],
            },
          ]}
          width={400}
          height={200}
        />
      </div>
    </div>
  );
};

export default Report;
