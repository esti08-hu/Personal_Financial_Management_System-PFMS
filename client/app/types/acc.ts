export interface NewAccount {
  type: string;
  balance: number;
  title: string;
};

export interface Account {
  userId: string;
  title: string;
  balance: number;
  id: string;
};

export type Transaction = {
  id: string;
  userId?: string;
  accountId: string;
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
  accountId: string;
  createdAt: string;
  description: string;
};

export type EditTransaction = {
  id: string;
  account: {
    id: string;
    title: string;
    balance: number;
  };
  createdAt: string;
  type: string;
  amount: number;
  description: string;
};



export type EditAccount = {
  id: string;
  type: string;
  balance: number;
  title: string;
  createdAt: string;
};

export type EditBudget = {
  id: string;
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
