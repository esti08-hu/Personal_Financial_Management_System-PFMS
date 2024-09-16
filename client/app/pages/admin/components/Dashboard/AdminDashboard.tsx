"use client";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import TableOne from "../Tables/TableOne.tsx";
import CardDataStats from "../CardDataStats.tsx";
import TableTwo from "../Tables/TableTwo.tsx";
import {
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineLockClosed,
} from "react-icons/hi";
import apiClient from "@/app/lib/axiosConfig.js";
import axios from "axios";

const ChartThree = dynamic(() => import("../Charts/ChartThree.tsx"), {
  ssr: false,
});

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [lockedAccounts, setLockedAccounts] = useState(0);
  const [totalTransactions, setTotalTranasactions] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get(
          "http://localhost:3001/users/new-users"
        );
        const totalAccountsResponse = await axios.get(
          "http://localhost:3001/users/total-accounts"
        );
        const lockedAccountsResponse = await axios.get(
          "http://localhost:3001/users/locked-accounts"
        );
        const totalTransactionResponse = await axios.get(
          "http://localhost:3001/transaction/count"
        );

        setUsers(userResponse.data.data);
        setTotalAccounts(totalAccountsResponse.data);
        setLockedAccounts(lockedAccountsResponse.data);
        setTotalTranasactions(totalTransactionResponse.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchData();
  }, []);
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
        <CardDataStats title="Total Users" total={totalAccounts}>
          <HiOutlineUsers className="text-[#00ABCD] text-2xl dark:text-white" />
        </CardDataStats>
        <CardDataStats title="Total Transactions" total={totalTransactions}>
          <HiOutlineClipboardList className="text-[#00ABCD] text-2xl dark:text-white" />
        </CardDataStats>
        <CardDataStats title="Locked Accounts" total={lockedAccounts}>
          <HiOutlineLockClosed className="text-[#00ABCD] text-2xl dark:text-white" />
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartThree />
        <div className="col-span-12 md:col-span-7">
          <TableTwo users={users} />
        </div>
        <div className="col-span-12">
          <TableOne />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
