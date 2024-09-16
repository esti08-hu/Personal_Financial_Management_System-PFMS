"use client";

import { useTransactionStore } from "@/app/pages/store/transactionStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AddTransaction = () => {
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const [type, setType] = useState("Expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    await addTransaction({ type, amount, date, description });

    setType("Expense");
    setAmount("");
    setDate("");
    setDescription("");
  };

  return (
    <div className="min-h-fit flex items-center justify-center px-4 sm:px-2 lg:px-4">
      <div className="container max-w-2xl mx-auto bg-white py-10 px-8 border-sm border-stroke border">
        <div className="flex flex-col gap-4 mb-5">
          <h1 className="text-2xl font-bold text-[#22577A]">
            Transaction Form
          </h1>
          <p className="text-gray-600 mt-2">
            Required fields are marked <span className="text-red">*</span>
          </p>
          <hr className="text-gray w-full" />
        </div>

        <form className="w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row mb-5">
            <label
              htmlFor="type"
              className="block mb-2 text-lg text-graydark sm:w-40"
            >
              Type :
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-gray-50 border border-gray text-graydark text-md rounded-lg block w-full p-2.5"
            >
              <option>Expense</option>
              <option>Income</option>
              <option>Saving</option>
              <option>Debt</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row mb-5">
            <label
              htmlFor="amount"
              className="block mb-2 text-lg text-graydark sm:w-40"
            >
              Amount <span className="text-red">*</span> :
            </label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-gray text-gray text-md rounded-lg block w-full p-2.5"
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row mb-5">
            <label
              htmlFor="date"
              className="block mb-2 text-lg text-graydark sm:w-40"
            >
              Date <span className="text-red">*</span>:
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray text-graydark text-md rounded-lg block w-full p-2.5"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row mb-5">
            <label
              htmlFor="description"
              className="block mb-2 text-lg font-md text-graydark sm:w-40"
            >
              Description :
            </label>
            <textarea
              id="description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block p-2.5 w-full text-md text-graydark rounded-lg border border-gray"
              placeholder="Description..."
            />
          </div>

          <div className="w-full flex justify-center">
            <motion.button
              whileTap="tap"
              whileHover="hover"
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-64 text-white bg-[#00ABCD] hover:bg-[#37a5bb] focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold text-md px-16 py-2.5 text-center rounded-lg transition-all duration-300 mb-6"
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

export default AddTransaction;
