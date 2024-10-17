export type User = {
  pid: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  accountLockedUntil: string;
  deletedAt: string;
  isEmailConfirmed: boolean;
  profilePicture?: string;
};

export type TopUsers = {
  userName: string;
  userEmail: string;
  transactionCount: number;
  budgetCount: number;
  status: string;
  accountLockedUntil: string;
};

export interface Admin {
  pid: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profilePicture?: string;
}