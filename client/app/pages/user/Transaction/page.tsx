"use client";

import { useEffect, useState } from "react";
import "flowbite";
import { useTransactionStore } from "../../store/transactionStore";
import Model from "@/app/components/user components/Model";
import Loader from "../../../components/admin components/common/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";
import { Tag } from "antd";
import Breadcrumb from "../../../components/admin components/Breadcrumbs/Breadcrumb";

type Transaction = {
  id: string;
  userId: string;
  date: string;
  type: string;
  amount: string;
  description: string;
};

const Transaction = () => {
  const {
    transactions,
    fetchTransactions,
    editTransaction,
    deleteTransaction,
  } = useTransactionStore();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTransactionData, setEditTransactionData] = useState<
    Partial<Transaction>
  >({
    id: "",
    date: "",
    type: "",
    amount: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchTransactions();
      setIsLoading(false);
    };

    fetchData();
  }, [fetchTransactions]);

  const handleEdit = (transaction: Transaction) => {
    setIsEditing(true);
    setEditTransactionData(transaction);
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await editTransaction(editTransactionData as Transaction);
    await fetchTransactions();
    setIsEditing(false);
    setEditTransactionData({
      id: "",
      date: "",
      type: "",
      amount: "",
      description: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditTransactionData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 w-4/5">
        <Loader />
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-2xl font-semibold text-gray-600">
          You have no transactions. Please add a transaction.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stroke rounded-sm px-6 py-8 h-full flex justify-center items-center">
      <div className="container">
        <div className="flex flex-col gap-2 mb-5">
          <h1 className="text-xl font-bold text-[#22577A]">Transaction List</h1>
        </div>

        <div className="">
          <table className="w-full bg-white text-sm text-left">
            <thead className="text-md text-graydark uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Description</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="">
              <AnimatePresence>
                {transactions.map((transaction) => (
                  <motion.tr
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  key={transaction.id}
                    className="bg-white border-b text-lg border-gray hover:bg-gray-3"
                  >
                    <td className="p-3 text-sm sm:text-xs md:text-sm">
                      
                      <Tag
                      className="!z-0"
                        color={
                          transaction.type === "Deposit"
                            ? "green"
                            : transaction.type === "Withdrawal"
                            ? "red"
                            : "yellow"
                        }
                      >
                        {transaction.type}
                      </Tag>
                    </td>

                    <td className="p-3 text-sm sm:text-xs md:text-sm">
                      {transaction.type === "Deposit" ? "+" : "-"}
                      {transaction.amount} ETB
                    </td>
                    <td className="p-3 max-w-33 text-sm sm:text-xs md:text-sm overflow-x-auto">
                      {transaction.description}
                    </td>
                    <td className="p-3 text-sm sm:text-xs md:text-sm whitespace-nowrap">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => handleEdit(transaction)}
                        className="font-bold text-lg hover:underline mr-2"
                      >
                        <HiOutlinePencilAlt className="text-2xl hover:text-[#00ABCD] text-gray" />
                      </button>
                      |
                      <button
                        type="button"
                        onClick={() => handleDelete(transaction.id)}
                        className="font-bold text-lg text-red-600 dark:text-red-500 hover:underline"
                      >
                        <HiOutlineTrash className="text-2xl hover:text-danger text-gray" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {isEditing && (
          <Model
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleUpdate={handleUpdate}
            handleChange={handleChange}
            editTransactionData={editTransactionData}
          />
        )}
      </div>
    </div>
  );
};

export default Transaction;
