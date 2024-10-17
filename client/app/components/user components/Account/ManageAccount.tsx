"use client";

// import "flowbite";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccountStore } from "@/app/pages/store/accountStore";
import Loader from "@/app/common/Loader";
import { motion } from "framer-motion";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";
import { Pagination } from "antd";
import type { EditAccount } from "@/app/types/acc";
import Model from "./Model";


const ManageAccount = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
      setIsClient(true);
  }, []);

  const { accounts, fetchAccounts, editAccount, deleteAccount } =
    useAccountStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Initialize editAccountData with all non-optional values
  const [editAccountData, setEditAccountData] = useState<EditAccount>({
    id: 0,
    title: "",
    type: "",
    balance: 0,
    createdAt: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Calculate the start and end index for slicing the users array
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAccounts = accounts.slice(startIndex, endIndex);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchAccounts();
      setIsLoading(false);
    };

    fetchData();
  }, [fetchAccounts]);

  const handleEdit = (account: EditAccount) => {
    setIsEditing(true);
    setEditAccountData(account); // Make sure account is fully populated before setting editAccountData
  };

  const handleDelete = async (id: number) => {
    await deleteAccount(id);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await editAccount(editAccountData);
    await fetchAccounts();
    setIsEditing(false);
    setEditAccountData({
      id: 0,
      type: "",
      createdAt: "",
      title: "",
      balance: 0,
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

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
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

  if (!isClient) return null;

  return (
    <div className="userdashboard-container h-full flex justify-center items-center bg-white border border-stroke rounded-sm px-6 py-8 flex-col">
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
                <th scope="col" className="p-3">
                  Date
                </th>
                <th scope="col" className="px-3 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="">
                {paginatedAccounts.map((account) => (
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
                    <td className="p-3 text-sm sm:text-xs md:text-sm whitespace-nowrap">
                      {new Date(account.createdAt).toLocaleDateString()}
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
      {/* Pagination Component */}
      <Pagination
        className="mt-5"
        current={currentPage}
        pageSize={pageSize}
        total={accounts.length}
        onChange={handlePageChange}
        showSizeChanger
      />
    </div>
  );
};

export default ManageAccount;
