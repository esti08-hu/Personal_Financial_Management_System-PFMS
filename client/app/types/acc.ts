export interface NewAccount {
  type: string;
  balance: number;
  title: string;
};

export interface Account {
  userId: number;
  title: string;
  balance: number;
  id: number;
};

export type Transaction = {
  id: number;
  userId?: number;
  accountId: number;
  account: Account;
  type: string;
  amount: number;
  balance: number;
  createdAt: string;
  description: string;
};

export type NewTransaction = {
  type: string;
  amount: number;
  balance: number;
  accountId: number;
  createdAt: string;
  description: string;
};

export type EditTransaction = {
  id: number;
  account: {
    id: number;
    title: string;
    balance: number;
  };
  createdAt: string;
  type: string;
  amount: number;
  description: string;
};



export type EditAccount = {
  id: number;
  type: string;
  balance: number;
  title: string;
  createdAt: string;
};

export type EditBudget = {
  id: number;
  createdAt: string;
  type: string;
  amount: number;
  title: string;
};
 
export type NewBudget = {
  type: string;
  amount: number;
  date: string;
  title: string;
}
