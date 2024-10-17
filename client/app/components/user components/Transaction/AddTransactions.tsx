import { useTransactionStore } from "@/app/pages/store/transactionStore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "@/app/lib/axiosConfig";
import type { Account, NewTransaction } from "@/app/types/acc";

const AddTransaction = () => {
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const [type, setType] = useState("Deposit");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState<string>("");
  const [amount, setAmount] = useState(1);
  const [createdAt, setCreatedAt] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [balance, setBalance] = useState<number>();

  // Fetch accounts from API
  const fetchAccounts = async (userId: number) => {
    try {
      const response = await apiClient.get(`/account/${userId}`);
      const data = await response.data;
      setAccounts(data);
    } catch (error) {
      console.error("Failed to fetch accounts", error);
      toast.error("Failed to fetch accounts");
    }
  };

  const fetchUserIdAndAccounts = async () => {
    try {
      const userIdResponse = await apiClient.get("/user/userId");
      const userId = userIdResponse.data;
      fetchAccounts(userId);
    } catch (error) {
      console.error("Failed to fetch user ID", error);
      toast.error("Failed to fetch user ID");
    }
  };

  // Fetch user ID and accounts on component mount
  useEffect(() => {
    fetchUserIdAndAccounts();
  }, []);

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const selectedAccount = accounts.find(
      (acc) => acc.id === Number(accountId)
    );

    if (selectedAccount) {
      if (
        (type === "Withdrawal" || type === "Transfer") &&
        value > selectedAccount.balance
      ) {
        setError("Amount exceeds account balance");
      } else {
        setError("");
        setBalance(selectedAccount?.balance ?? 0);
      }
    }
    setAmount(value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const selectedAccount = accounts.find(
      (acc) => acc.id === Number(accountId)
    );

    if (!selectedAccount) {
      toast.error("No account selected");
      return;
    }

    // Calculate updated balance based on the transaction type
    let updatedBalance: number;
    if (type === "Deposit") {
      updatedBalance = selectedAccount?.balance + amount;
    } else if (type === "Withdrawal" || type === "Transfer") {
      if (amount > selectedAccount.balance) {
        toast.error("Insufficient balance");
        return;
      }
      updatedBalance = (selectedAccount?.balance ?? 0) - amount;
    } else {
      toast.error("Invalid transaction type");
      return;
    }

    setIsLoading(true);

    const newTransaction: NewTransaction = {
      type,
      amount,
      balance: updatedBalance,
      accountId: Number(accountId),
      createdAt,
      description,
    };

    await addTransaction(newTransaction, selectedAccount.userId);

    setIsLoading(false);
    fetchUserIdAndAccounts();

    // Reset the form
    setType("");
    setAmount(1);
    setCreatedAt("");
    setDescription("");
    setError("");
  };

  return (
    <div className="min-h-fit flex items-center justify-center px-4 sm:px-2 lg:px-4">
      <div className="container max-w-2xl mx-auto bg-white py-10 px-8 border-sm border-stroke border">
        <div className="flex flex-col gap-4 mb-5">
          <h1 className="text-2xl font-bold text-[#22577A]">
            Transaction Form
          </h1>
          <p className="text-gray-600 mt-2">
            Required fields are marked <span className="text-red">*</span>
          </p>
          <hr className="text-gray w-full" />
        </div>

        <form className="w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row mb-5">
            <label
              htmlFor="type"
              className="block mb-2 text-lg text-graydark sm:w-40"
            >
              Type:
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-gray-50 border border-gray text-graydark text-md rounded-lg block w-full p-2.5"
            >
              <option value="Deposit">Deposit</option>
              <option value="Transfer">Transfer</option>
              <option value="Withdrawal">Withdrawal</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row mb-5">
            <label
              htmlFor="account"
              className="block mb-2 text-lg text-graydark sm:w-40"
            >
              Account:
            </label>
            <select
              id="account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="bg-gray-50 border border-gray text-graydark text-md rounded-lg block w-full p-2.5"
            >
              <option value="" disabled>
                Select an account
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.title} ({acc.balance} ETB)
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row mb-1">
            <label
              htmlFor="amount"
              className="block mb-2 text-lg text-graydark sm:w-40"
            >
              Amount <span className="text-red">*</span>:
            </label>
            <input
              type="number"
              id="amount"
              min={1}
              value={amount}
              onChange={handleAmountChange}
              className="border border-gray text-graydark text-md rounded-lg block w-full p-2.5"
              placeholder="Enter amount"
              required
            />
          </div>
          <div className="min-h-[24px] mb-2 ">
            {error && <p className="text-red ml-32">{error}</p>}
          </div>

          <div className="flex flex-col sm:flex-row mb-5">
            <label
              htmlFor="date"
              className="block mb-2 text-lg text-graydark sm:w-40"
            >
              Date <span className="text-red">*</span>:
            </label>
            <input
              type="date"
              id="date"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              className="border border-gray text-graydark text-md rounded-lg block w-full p-2.5"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row mb-5">
            <label
              htmlFor="description"
              className="block mb-2 text-lg font-md text-graydark sm:w-40"
            >
              Description:
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block p-2.5 w-full text-md text-graydark rounded-lg border border-gray"
              placeholder="Description..."
              required
              minLength={2}
            />
          </div>

          <div className="w-full flex justify-center">
            <motion.button
              whileTap="tap"
              whileHover="hover"
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center sm:w-64 text-white bg-[#00ABCD] hover:bg-[#37a5bb] focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold text-md px-16 py-2.5 text-center rounded-lg transition-all duration-300 mb-6"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  viewBox="0 0 24 24"
                  aria-labelledby="loadingTitle"
                >
                  <title id="loadingTitle">Loading...</title>
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                "Submit"
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
