import { useGroupStore } from "@/lib/state/groupStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import GroupForm from "./GroupForm";
import { useTransactionStore } from "@/lib/state/transactionStore";
import TransactionSummary from "./TransactionSummary";

const GroupTable = () => {
  return (
    <Card x-chunk="dashboard-06-chunk-0">
      <CardHeader>
        <CardTitle>Groups</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <GroupListing />
      </CardContent>
    </Card>
  );
};

export default GroupTable;

const GroupListing = () => {
  const { groups, deleteGroup } = useGroupStore();
  const { transactions } = useTransactionStore();
  const activeGroups = groups.filter((group) => group.isActive);
  const activeTransactions = transactions.filter(
    (transaction) => transaction.isActive
  );

  return (
    <>
      {activeGroups.map((group) => (
        <Card key={group.id} className="relative">
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
                  <DropdownMenuItem onClick={() => deleteGroup(group.id)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Group</DialogTitle>
                </DialogHeader>
                <GroupForm type="UPDATE" initialGroupValue={group} />
              </DialogContent>
            </Dialog>
          </div>
          <CardHeader className="p-3 flex flex-col items-start">
            <CardTitle className="text-base">{group.name}</CardTitle>
            <CardDescription>{group.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 flex flex-col items-start">
            <TransactionSummary
              group={group}
              transactions={activeTransactions.filter(
                (transaction) => transaction.group.id === group.id
              )}
            />
          </CardContent>
          <CardFooter className="p-3 flex flex-col items-start">
            <p>Total members: {group.members.length}</p>
          </CardFooter>
        </Card>
      ))}
    </>
  );
};
