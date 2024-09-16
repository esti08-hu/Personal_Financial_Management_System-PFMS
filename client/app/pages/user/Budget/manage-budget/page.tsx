"use client";

import { useEffect, useState } from "react";
import "flowbite";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Model from "./Model";
import { useBudgetStore } from "@/app/pages/store/budgetStore";
import Loader from "@/app/pages/admin/components/common/Loader";

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
  const router = useRouter();

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

  if (!budget?.length) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-2xl font-semibold text-gray-600 text-center">
          You have no Budgets. Please{" "}
          <Link href="/pages/user/Budget/set-budget">
            <span className="text-[#00ABCD]">set your Budget here.</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-fit flex items-center justify-center px-4 sm:px-2 lg:px-4">
      <div className="container max-w-2xl mx-auto bg-white py-10 px-8 border-sm border-stroke border">
        <div className="flex flex-col gap-4 mb-5">
          <h1 className="text-2xl font-bold text-[#22577A]">Budget List</h1>
          <hr className="h-1 bg-gray-400 w-full" />
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-lg text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Title
                </th>
                <th scope="col" className="px-6 py-3">
                  Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3">
                  Budget Date
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-lg">
              {budget.map((item) => (
                <tr
                  key={item.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-4">{item.title}</td>
                  <td className="px-6 py-4">{item.type}</td>
                  <td className="px-6 py-4">{item.amount}</td>
                  <td className="px-6 py-4">{item.date}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-4">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
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
            editBudgetData={editBudgetData}
          />
        )}
      </div>
    </div>
  );
};

export default BudgetPage;
