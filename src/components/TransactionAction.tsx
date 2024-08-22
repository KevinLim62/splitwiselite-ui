import { ArrowBigUpDash, HandCoins } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import ExpenseForm from "./ExpenseForm";

const TransactionAction = () => {
  return (
    <div className="flex items-center justify-end gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 gap-1 bg-red-400">
            <ArrowBigUpDash className="h-5 w-5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Expense
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] rounded-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm type="CREATE" />
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 gap-1 bg-green-400">
            <HandCoins className="h-5 w-5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Payment
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] rounded-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Payment</DialogTitle>
          </DialogHeader>
          {/* <PaymentForm type="CREATE" /> */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionAction;
