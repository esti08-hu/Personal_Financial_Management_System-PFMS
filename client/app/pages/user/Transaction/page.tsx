"use client";

import { useEffect, useState } from "react";
import "flowbite";
import { useRouter } from "next/navigation";
import { useTransactionStore } from "../../store/transactionStore";
import Model from "@/app/components/user components/Model";
import Loader from "../../admin/components/common/Loader";

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

  const router = useRouter();

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

  if (!transactions.length) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-2xl font-semibold text-gray-600">
          You have no transactions. Please add a transaction.
        </div>
      </div>
    );
  }

  return (
    <div className="userdashboard-container h-full flex justify-center items-center">
      <div className="container">
        <div className="flex flex-col gap-4 mb-5">
          <h1 className="text-xl font-bold text-[#22577A]">Transaction List</h1>
          <hr className="h-1 bg-gray-400 w-full" />
        </div>
        <div className="relative overflow-x-auto h-2/3 overflow-y-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-lg text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3">
                  Description
                </th>
                <th scope="col" className="px-6 py-3">
                  Transaction Date
                </th>
                <th scope="col" className="px-6 py-3 text-center ">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-lg">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="bg-white border-b text-lg dark:border-gray-700 hover:bg-gray-200"
                >
                  <td className="px-6 py-4">{transaction.type}</td>
                  <td className="px-6 py-4">{transaction.amount}</td>
                  <td className="px-6 py-4">{transaction.description}</td>
                  <td className="px-6 py-4 font-medium whitespace-nowrap">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 text-center flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(transaction)}
                      className="font-bold text-lg text-[#00ABCD] hover:underline mr-2"
                    >
                      Edit
                    </button>
                    |
                    <button
                      type="button"
                      onClick={() => handleDelete(transaction.id)}
                      className="font-bold text-lg text-red-600 dark:text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
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
