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
  DialogClose,
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
import { useRef } from "react";
import { useGroupStore } from "@/lib/state/groupStore";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

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
  const { groups } = useGroupStore();
  const activeTransactions = transactions.filter(
    (transactions) => transactions.isActive
  );
  const transactionFormRef = useRef<HTMLButtonElement>(null);

  return (
    <Accordion type="single" collapsible className="w-full">
      {groups.map((group) => (
        <AccordionItem
          key={group.id}
          value={`${group.id}-${group.name}`}
          className="border-b-2"
        >
          <AccordionTrigger>
            <Card className="w-[90%] border-0 shadow-none">
              <CardHeader className="flex flex-row items-center justify-start">
                <CardTitle>{group.name}</CardTitle>
                {group.description && <span>({group.description})</span>}
              </CardHeader>
            </Card>
          </AccordionTrigger>
          <AccordionContent className="px-2 xl:px-5 flex flex-col justify-center gap-5">
            {activeTransactions
              .filter((el) => el.group.id === group.id)
              .map((transaction) => (
                <Card key={transaction.id} className="relative">
                  <div className="absolute right-0">
                    <Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
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
                            onClose={() => transactionFormRef.current?.click()}
                          />
                        )}
                        {transaction.type === "PAYMENT" && (
                          <PaymentForm
                            type="UPDATE"
                            initialPaymentValue={transaction}
                          />
                        )}
                      </DialogContent>
                      <DialogClose ref={transactionFormRef}></DialogClose>
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
                      {transaction?.expenseSplits &&
                        transaction.expenseSplits.length > 0 && (
                          <div className="p-2 text-base font-medium">
                            Expense split breakdown ({transaction.currency}
                            ):
                            {transaction.expenseSplits.map((split) => (
                              <div
                                key={split.memberId}
                                className="text-slate-700 font-normal"
                              >
                                {split.name}: {split.amount.toFixed(2)}
                              </div>
                            ))}
                          </div>
                        )}
                      <div>
                        {new Date(transaction.createdAt).toDateString()}
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
