"use client";

import { useEffect, useState } from "react";
// import "flowbite";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Model from "./Model";
import { useBudgetStore } from "@/app/pages/store/budgetStore";
import Loader from "@/app/common/Loader";
import { Pagination, Tag } from "antd";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";
import type { EditBudget } from "@/app/types/acc";

const ManageBudget = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { budget, fetchBudget, editBudget, deleteBudget } = useBudgetStore();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editBudgetData, setEditBudgetData] = useState<EditBudget>({
    id: 0,
    createdAt: "",
    type: "",
    amount: 0,
    title: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Calculate the start and end index for slicing the users array
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedBudgets = budget.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchBudget();
      setIsLoading(false);
    };

    fetchData();
  }, [fetchBudget]);

  const handleEdit = (budget: EditBudget) => {
    setIsEditing(true);
    setEditBudgetData(budget);
  };

  const handleDelete = async (id: number) => {
    await deleteBudget(id);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await editBudget(editBudgetData);
    await fetchBudget();
    setIsEditing(false);
    setEditBudgetData({
      id: 0,
      createdAt: "",
      type: "",
      amount: 0,
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

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
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
    <div className="relative h-full flex justify-center items-center bg-white border border-stroke rounded-sm px-6 py-8 flex-col">
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
                {paginatedBudgets.map((item) => (
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
                      {new Date(item.createdAt).toLocaleDateString()}
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
      <Pagination
        className="mt-5"
        current={currentPage}
        pageSize={pageSize}
        total={budget.length}
        onChange={handlePageChange}
        showSizeChanger
      />
    </div>
  );
};

export default ManageBudget;
