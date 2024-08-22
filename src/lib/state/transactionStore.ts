import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Group } from "./groupStore";
import { User } from "./userStore";
import { Member } from "./memberStore";

export type Currency = "USD" | "EUR" | "GBP" | "MYR";

export type ExpenseSplit = {
  memberId: number;
  amount: number;
};

export type Transaction = {
  id: number;
  description: string;
  type: "EXPENSE" | "PAYMENT";
  group: Group;
  paidBy: User | Member;
  paidTo?: User | Member;
  expenseSplits?: ExpenseSplit[];
  splitMethod?: string;
  amount: string;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

interface TransactionSlice {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  editTransaction: (updatedTransaction: Transaction) => void;
  deleteTransaction: (id: number) => void; // Corrected to match the function signature in the interface
}

export const useTransactionStore = create<TransactionSlice>()(
  persist(
    (set) => ({
      transactions: [] as Transaction[], // Corrected to plural 'transactions'

      addTransaction: (transaction: Transaction) =>
        set((state: { transactions: Transaction[] }) => ({
          transactions: [transaction, ...state.transactions], // Corrected to push the new transaction into the array
        })),

      editTransaction: (updatedTransaction: Transaction) =>
        set((state: { transactions: Transaction[] }) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === updatedTransaction.id
              ? updatedTransaction
              : transaction
          ), // Properly replacing the updated transaction in the list
        })),

      deleteTransaction: (id: number) =>
        set((state: { transactions: Transaction[] }) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id
              ? { ...transaction, isActive: false }
              : transaction
          ),
        })),
    }),
    {
      name: "transaction-data", // name of the item in the storage (must be unique)
    }
  )
);
