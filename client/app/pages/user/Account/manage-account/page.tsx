"use client";

import { useEffect, useState } from "react";
import "flowbite";
import { useRouter } from "next/navigation";
import Model from "./Model";
import { useAccountStore } from "@/app/pages/store/accountStore";
import Loader from "@/app/components/admin components/common/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";

type Account = {
  id: string;
  userId: string;
  type: string;
  balance: string;
  title: string;
};

const Account = () => {
  const { accounts, fetchAccounts, editAccount, deleteAccount } =
    useAccountStore();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editAccountData, setEditAccountData] = useState<Partial<Account>>({
    id: "",
    title: "",
    type: "",
    balance: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchAccounts();
      setIsLoading(false);
    };

    fetchData();
  }, [fetchAccounts]);

  const handleEdit = (account: Account) => {
    setIsEditing(true);
    setEditAccountData(account);
  };

  const handleDelete = async (id: string) => {
    await deleteAccount(id);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await editAccount(editAccountData as Account);
    await fetchAccounts();
    setIsEditing(false);
    setEditAccountData({
      id: "",
      type: "",
      title: "",
      balance: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditAccountData((prevData) => ({
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

  if (!accounts.length) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-2xl font-semibold text-gray-600">
          You have no Account. Please add an Account.
        </div>
      </div>
    );
  }

  return (
    <div className="userdashboard-container h-full flex justify-center items-center bg-white border border-stroke rounded-sm px-6 py-8 ">
      <div className="container">
        <div className="flex flex-col gap-2 mb-5">
          <h1 className="text-xl font-bold text-[#22577A]">Account List</h1>
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
                  Balance
                </th>
                <th scope="col" className="px-3 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="">
              <AnimatePresence>
                {accounts.map((account) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    key={account.id}
                    className="bg-white border-b text-lg border-gray hover:bg-gray-3"
                  >
                    <td className="p-3 text-md sm:text-sm md:text-sm">
                      {account.title}
                    </td>
                    <td className="p-3 !text-md sm:text-sm md:text-sm">
                      {account.type}
                    </td>
                    <td className="p-3 text-md sm:text-sm md:text-sm">
                      {account.balance} ETB
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(account)}
                        className="font-bold text-lg text-[#00ABCD] hover:underline mr-2"
                      >
                        <HiOutlinePencilAlt className="text-2xl hover:text-[#00ABCD] text-gray" />
                      </button>
                      |
                      <button
                        type="button"
                        onClick={() => handleDelete(account.id)}
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
            editAccountData={editAccountData}
          />
        )}
      </div>
    </div>
  );
};

export default Account;
