"use client";

import { useBudgetStore } from "@/app/pages/store/budgetStore";
import { useState } from "react";
import { motion } from "framer-motion";

const SetBudget = () => {
  const setBudget = useBudgetStore((state) => state.setBudget);
  const [type, setType] = useState("Expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    await setBudget({ type, amount, date, title });

    // Clear form fields after successful submission
    setType("Expense");
    setAmount("");
    setDate("");
    setTitle("");
    setIsLoading(false);
  };

  return (
    <div className="min-h-fit flex items-center justify-center px-4 sm:px-2 lg:px-4">
      <div className="container max-w-2xl mx-auto bg-white py-10 px-8 border-sm border-stroke border">
        <div className="flex flex-col gap-4 mb-5">
          <h1 className="text-2xl font-bold text-[#22577A]">
            Budget Form</h1>
          <p className="text-gray-600 mt-2">
            Required fields are marked <span className="text-red">*</span>
          </p>
          <hr className="h-1 text-gray w-full" />
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row items-center mb-5">
            <label
              htmlFor="title"
              className="block text-lg text-graydark sm:w-40 mb-2 sm:mb-0"
            >
              Title:
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className=" border border-gray text-graydark text-md rounded-lg w-full p-2.5"
              placeholder="Enter your title"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center mb-5">
            <label
              htmlFor="type"
              className="block text-lg text-graydark sm:w-40 mb-2 sm:mb-0"
            >
              Type:
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-gray text-graydark text-md rounded-lg w-full p-2.5"
            >
              <option>Expense</option>
              <option>Income</option>
              <option>Saving</option>
              <option>Debt</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-center mb-5">
            <label
              htmlFor="amount"
              className="block text-lg text-graydark sm:w-40 mb-2 sm:mb-0"
            >
              Amount <span className="text-red">*</span>:
            </label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-gray text-graydark text-md rounded-lg w-full p-2.5"
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center mb-5">
            <label
              htmlFor="date"
              className="block text-lg text-graydark sm:w-40 mb-2 sm:mb-0"
            >
              Date <span className="text-red">*</span>:
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray text-graydark text-md rounded-lg w-full p-2.5"
              required
            />
          </div>

          <div className="w-full flex justify-center mt-6">
            <motion.button
              whileTap="tap"
              whileHover="hover"
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-64 flex justify-center text-white bg-[#00ABCD] hover:bg-[#37a5bb] focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold text-md px-16 py-2.5 rounded-lg transition-all duration-300"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  viewBox="0 0 24 24"
                  aria-labelledby="loadingTitle"
                >
                  <title id="loadingTitle">Loading...</title>
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                "Submit"
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetBudget;
