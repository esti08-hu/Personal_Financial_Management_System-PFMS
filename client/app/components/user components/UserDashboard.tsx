"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/app/lib/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaWallet, FaExchangeAlt, FaChartLine } from "react-icons/fa";
import Loader from "@/app/pages/admin/components/common/Loader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface User {
  firstName: string;
  lastName: string;
  id: string;
}

interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  description: string;
}

interface Budget {
  id: string;
  userId: string;
  title: string;
  type: string;
  amount: number;
  date: string;
}

const UserDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await apiClient.get("/auth/user-profile");
        const transactionResponse = await apiClient.get(
          `/transaction/${userResponse.data.id}`
        );

        setUser(userResponse.data);
        setTransactions(transactionResponse.data);
        // setBudgets(budgetResponse.data);
        // setBalance(calculateBalance(transactionResponse.data));
        setIsLoading(false);
      } catch (error) {
        toast.error("Error fetching user data");
        router.push("/login");
      }
    };

    fetchUserData();
  }, [router]);

  const calculateBalance = (transactions: Transaction[]): number => {
    return transactions.reduce((acc, transaction) => {
      return transaction.type === "income"
        ? acc + transaction.amount
        : acc - transaction.amount;
    }, 0);
  };

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const chartData = {
    labels: transactions.map((t) => new Date(t.date).toLocaleDateString()),
    datasets: [
      {
        label: "Balance",
        data: transactions.map((_, index) =>
          calculateBalance(transactions.slice(0, index + 1))
        ),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex justify-center items-center w-full h-screen"
      >
        <Loader />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="userdashboard-container w-full min-h-screen rounded-md p-4"
    >
      <div className="w-full mx-auto">
        <h3 className="text-xl font-bold text-graydark mb-8">
          Welcome, {user?.name}!
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            icon={<FaWallet className="text-2xl  text-blue-500" />}
            title="Current Balance"
            value={`${balance.toFixed(2)} ETB`}
          />
          <DashboardCard
            icon={<FaExchangeAlt className="text-2xl text-green-500" />}
            title="Total Transactions"
            value={transactions.length.toString()}
          />
          <DashboardCard
            icon={<FaChartLine className="text-2xl text-purple-500" />}
            title="Active Budgets"
            value={budgets.length.toString()}
          />
        </div>

        <div className="rounded-sm p-6 border border-stroke bg-white px-7.5 py-6 shadow-default">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Description</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {recentTransactions.map((transaction) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="border-b"
                    >
                      <td className="p-3">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="p-3">{transaction.type}</td>
                      <td
                        className={`p-3 ${
                          transaction.type === "income"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {transaction.amount} ETB
                      </td>
                      <td className="p-3">{transaction.description}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </motion.div>
  );
};

const DashboardCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
}> = ({ icon, title, value }) => (
  <motion.div
    className="p-6 flex items-center justify-center rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default"
  >
    <div className="mr-4 md:text-sm">{icon}</div>
    <div>
      <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
      <p className="text-lg font-bold text-center">{value}</p>
    </div>
  </motion.div>
);

export default UserDashboard;
