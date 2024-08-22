import { useTransactionStore } from "@/lib/state/transactionStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { MoreVertical } from "lucide-react";
import ExpenseForm from "./ExpenseForm";
import PaymentForm from "./PaymentForm";

const TransactionTable = () => {
  return (
    <Card x-chunk="dashboard-06-chunk-0">
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <TransactionListing />
      </CardContent>
    </Card>
  );
};

export default TransactionTable;

const TransactionListing = () => {
  const { transactions, deleteTransaction } = useTransactionStore();
  const activeTransactions = transactions.filter(
    (transactions) => transactions.isActive
  );

  return (
    <>
      {activeTransactions.map((transaction) => (
        <Card key={transaction.id} className="relative">
          <div className="absolute right-0">
            <Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DialogTrigger asChild>
                    <DropdownMenuItem>
                      <span>Edit</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DropdownMenuItem
                    onClick={() => deleteTransaction(transaction.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogContent className="max-h-[80vh] rounded-md overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Transaction</DialogTitle>
                </DialogHeader>
                {transaction.type === "EXPENSE" && (
                  <ExpenseForm
                    type="UPDATE"
                    initialExpenseValue={transaction}
                  />
                )}
                {transaction.type === "PAYMENT" && (
                  <PaymentForm
                    type="UPDATE"
                    initialPaymentValue={transaction}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
          <CardHeader className="p-3 flex flex-col items-start">
            <CardTitle className="text-base">
              {transaction.description}
            </CardTitle>
            <CardDescription className="flex flex-col items-start gap-1 text-sm">
              <div>Group: {transaction.group.name}</div>
              {transaction.type === "EXPENSE" && (
                <div className="text-red-400">{transaction.type}</div>
              )}
              {transaction.type === "PAYMENT" && (
                <div className="text-green-400">{transaction.type}</div>
              )}
              <div className="font-semibold">
                {transaction.amount} {transaction.currency}
              </div>
              <div>
                Paid by{" "}
                <span className="underline underline-offset-1">
                  {transaction.paidBy.name}
                </span>
              </div>
              {transaction?.paidTo && (
                <div>
                  Paid to{" "}
                  <span className="underline underline-offset-1">
                    {transaction.paidTo.name}
                  </span>
                </div>
              )}
              <div>{new Date(transaction.createdAt).toDateString()}</div>
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </>
  );
};
