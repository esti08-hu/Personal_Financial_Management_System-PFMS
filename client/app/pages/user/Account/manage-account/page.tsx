"use client";

import { useEffect, useState } from "react";
import "flowbite";
import { useRouter } from "next/navigation";
import Model from "./Model";
import { useAccountStore } from "@/app/pages/store/accountStore";
import Loader from "@/app/pages/admin/components/common/Loader";

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
        <Loader/>
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
    <div className="userdashboard-container h-full flex justify-center items-center">
      <div className="container">
        <div className="flex flex-col gap-4 mb-5">
          <h1 className="text-xl font-bold text-[#22577A]">Account List</h1>
          <hr className="h-1 bg-gray-400 w-full" />
        </div>
        <div className="relative overflow-x-auto h-2/3 overflow-y-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-lg text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Title
                </th>
                <th scope="col" className="px-6 py-3">
                  Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Balance
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-lg">
              {accounts.map((account) => (
                <tr
                  key={account.id}
                  className="bg-white border-b text-lg dark:border-gray-700 hover:bg-gray-200"
                >
                  <td className="px-6 py-4 font-medium whitespace-nowrap">
                    {account.title}
                  </td>
                  <td className="px-6 py-4">{account.type}</td>
                  <td className="px-6 py-4">{account.balance}</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(account)}
                      className="font-bold text-lg text-[#00ABCD] hover:underline mr-2"
                    >
                      Edit
                    </button>
                    |
                    <button
                      type="button"
                      onClick={() => handleDelete(account.id)}
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
            editAccountData={editAccountData}
          />
        )}
      </div>
    </div>
  );
};

export default Account;
