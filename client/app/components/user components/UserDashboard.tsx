import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/app/lib/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AnimatePresence, motion } from "framer-motion";
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
import Loader from "@/app/common/Loader";
import { Tag } from "antd";
import DashboardCard from "./Dashboard/DashboardCard";

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
  name: string;
  id: string;
}

interface Transaction {
  id: string;
  createdAt: string;
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

const UserDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  const fetchUserData = async () => {
    try {
      const userResponse = await apiClient.get("/auth/user-profile");
      const transactionResponse = await apiClient.get(
        `/transaction/recent/${userResponse.data.id}`
      );
      const balanceResponse = await apiClient.get(
        `account/balance${userResponse.data.id}`
      );
      const transactionCountResponse = await apiClient.get(
        `/transaction/count/${userResponse.data.id}`
      );
      const budgetResponse = await apiClient.get(
        `/budget/${userResponse.data.id}`
      );
      setTransactionCount(transactionCountResponse.data);
      setBudgets(budgetResponse.data);
      setUser(userResponse.data);
      setTransactions(transactionResponse.data);
      setBalance(balanceResponse.data);
      setIsLoading(false);
    } catch (error) {
      toast.error("Error fetching user data");
      router.push("/pages/login");
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchUserData();
  }, [router]);

  if (!isClient) return null;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex justify-center items-center w-full h-46"
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
      className="userdashboard-container w-full rounded-md p-4"
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
            value={transactionCount.toString()}
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
                  {transactions.map((transaction) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="border-b border-gray"
                    >
                      <td className="p-3 sm:text-sm lg:!text-lg">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm sm:text-xs md:text-sm lg:!text-lg">
                        <Tag
                          className="lg:!text-[16px]"
                          color={
                            transaction.type === "Deposit"
                              ? "success"
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
                      <td className="p-3 sm:text-xs !text-sm lg:!text-lg">
                        {transaction.description}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserDashboard;