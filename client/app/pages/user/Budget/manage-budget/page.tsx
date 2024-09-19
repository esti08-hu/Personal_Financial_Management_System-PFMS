"use client";

import { useEffect, useState } from "react";
import "flowbite";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Model from "./Model";
import { useBudgetStore } from "@/app/pages/store/budgetStore";
import Loader from "@/app/components/admin components/common/Loader";
import { Tag } from "antd";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";

type Budget = {
  id: string;
  userId: string;
  date: string;
  type: string;
  amount: string;
  title: string;
};

const BudgetPage = () => {
  const { budget, fetchBudget, editBudget, deleteBudget } = useBudgetStore();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editBudgetData, setEditBudgetData] = useState<Partial<Budget>>({
    id: "",
    date: "",
    type: "",
    amount: "",
    title: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchBudget();
      setIsLoading(false);
    };

    fetchData();
  }, [fetchBudget]);

  const handleEdit = (budget: Budget) => {
    setIsEditing(true);
    setEditBudgetData(budget);
  };

  const handleDelete = async (id: string) => {
    await deleteBudget(id);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await editBudget(editBudgetData as Budget);
    await fetchBudget();
    setIsEditing(false);
    setEditBudgetData({
      id: "",
      date: "",
      type: "",
      amount: "",
      title: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditBudgetData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 w-full">
        <Loader />
      </div>
    );
  }

  if (!budget || budget.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className=" font-semibold text-gray-600 text-center">
          You currently have no budgets set. Please{" "}
          <Link href="/pages/user/Budget/set-budget">
            <span className="text-[#00ABCD] hover:underline">
              create a budget here.
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex justify-center items-center bg-white border border-stroke rounded-sm px-6 py-8">
      <div className="container">
        <div className="flex flex-col gap-2 mb-5">
          <h1 className="text-xl font-bold text-[#22577A]">Budget List</h1>
        </div>

        <div className="">
          <table className="w-full bg-white text-sm text-left py-2 px-4">
            <thead className="text-md text-graydark uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="p-3">
                  Title
                </th>
                <th scope="col" className="p-3">
                  Type
                </th>
                <th scope="col" className="p-3">
                  Amount
                </th>
                <th scope="col" className="p-3">
                  Date
                </th>
                <th scope="col" className="p-3 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-lg">
              <AnimatePresence>
                {budget.map((item) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    key={item.id}
                    className="bg-white border-b border-gray hover:bg-gray-3 "
                  >
                    <td className="p-3 text-sm sm:text-sm md:text-sm">
                      {item.title}
                    </td>
                    <td className="p-3 text-sm sm:text-xs md:text-sm">
                      <Tag
                        className=""
                        color={
                          item.type === "Deposit"
                            ? "green"
                            : item.type === "Withdrawal"
                            ? "red"
                            : "yellow"
                        }
                      >
                        {item.type}
                      </Tag>
                    </td>{" "}
                    <td className="p-3 text-sm sm:text-xs md:text-sm">
                      {item.type === "Deposit" ? "+" : "-"}
                      {item.amount} ETB
                    </td>
                    <td className="p-3 text-sm sm:text-sm md:text-sm whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="font-bold text-lg hover:underline mr-2"
                      >
                        <HiOutlinePencilAlt className="text-2xl hover:text-[#00ABCD] text-gray" />
                      </button>
                      |
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
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

        {true && (
          <Model
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleUpdate={handleUpdate}
            handleChange={handleChange}
            editBudgetData={editBudgetData}
          />
        )}
      </div>
    </div>
  );
};

export default BudgetPage;
