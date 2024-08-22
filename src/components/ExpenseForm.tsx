import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Group, useGroupStore } from "@/lib/state/groupStore";
import { Member, useMemberStore } from "@/lib/state/memberStore";
import { User } from "@/lib/state/userStore";
import {
  Currency,
  Transaction,
  useTransactionStore,
} from "@/lib/state/transactionStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useEffect, useState } from "react";

export const expenseFormSchema = z.object({
  description: z.string({
    required_error: "Expense description is required",
  }),
  type: z.custom<"EXPENSE" | "PAYMENT">().default("EXPENSE"),
  groupId: z.string({ required_error: "Group Id is required" }),
  paidById: z.string({ required_error: "Paid By Id is required" }),
  expenseSplits: z.array(z.any()),
  splitMethod: z.string().default("1"),
  amount: z.string({ required_error: "Amount is required" }),
  currency: z.custom<Currency>(),
});

type ExpenseFormProps = {
  type: "CREATE" | "UPDATE";
  initialExpenseValue?: Transaction;
};

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  type,
  initialExpenseValue,
}) => {
  const { transactions, addTransaction, editTransaction } =
    useTransactionStore();

  const { members } = useMemberStore();
  const { groups } = useGroupStore();

  const activeGroups = groups.filter((group) => group.isActive);
  const activeMembers = members.filter((members) => members.isActive);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<Member[]>();
  const [splitMethod, setSplitMethod] = useState(
    initialExpenseValue?.splitMethod ?? "1"
  );
  const form = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: initialExpenseValue ?? {
      description: "",
      type: "EXPENSE",
      groupId: "",
      paidById: "",
      splitMethod: "1",
      expenseSplits: [],
      amount: "0",
      currency: "GBP",
    },
  });
  const watchSelectedGroup = form.watch("groupId");

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof expenseFormSchema>) {
    const selectedGroup = activeGroups.find(
      (group) => group.id === parseInt(values.groupId)
    );

    const selectedPaidBy = activeMembers.find(
      (member) => member.id === parseInt(values.paidById)
    );

    if (!selectedGroup || !selectedPaidBy) {
      alert("Invalid group or paid by selected. Please check and try again.");
      return;
    }

    if (parseFloat(values.amount) < 0) {
      alert("Amount should not be negative.");
      return;
    }

    let formattedExpenseSplits;
    if (splitMethod === "1" && selectedGroupMembers) {
      //Equally split the expense amount
      formattedExpenseSplits = selectedGroupMembers.map((member) => ({
        memberId: member.id,
        amount: Math.round(
          parseFloat(values.amount) / selectedGroupMembers.length
        ),
      }));
    } else if (splitMethod === "2" && selectedGroupMembers) {
      let amount = 0;
      for (let index = 0; index < values.expenseSplits.length; index++) {
        amount += parseFloat(values.expenseSplits[index].amount);
        if (amount > parseFloat(values.amount)) {
          alert("Total split amount should not exceed the expense amount.");
          return;
        }
      }

      if (amount !== parseFloat(values.amount)) {
        alert("Total split amount should be equal to the expense amount.");
        return;
      }

      //Custom split the expense amount
      formattedExpenseSplits = values.expenseSplits.map((expense, index) => ({
        memberId: members[index].id,
        amount: parseFloat(expense.amount),
      }));
    }

    switch (type) {
      case "CREATE":
        addTransaction({
          ...values,
          id: transactions.length + 1,
          group: selectedGroup,
          paidBy: selectedPaidBy,
          splitMethod: splitMethod,
          expenseSplits: formattedExpenseSplits,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
        });
        break;

      case "UPDATE":
        editTransaction({
          ...values,
          id: initialExpenseValue!.id,
          group: selectedGroup,
          paidBy: selectedPaidBy,
          splitMethod: splitMethod,
          expenseSplits: formattedExpenseSplits,
          createdAt: initialExpenseValue!.createdAt,
          updatedAt: new Date().toISOString(),
          isActive: true,
        });
        break;

      default:
        break;
    }
  }

  useEffect(() => {
    if (watchSelectedGroup !== "") {
      const selectedGroup = activeGroups.find(
        (group) => group.id === parseInt(watchSelectedGroup)
      );

      const selectedGroupMember = activeMembers.filter((member) =>
        selectedGroup?.members.includes(member.id.toString())
      );

      setSelectedGroupMembers(selectedGroupMember);
    }
  }, [watchSelectedGroup]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="description" {...field} />
              </FormControl>
              <FormDescription>This is expense description.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Input disabled placeholder="type" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="groupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select involving group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activeGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>This is expense involved group.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedGroupMembers && (
          <FormField
            control={form.control}
            name="paidById"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paid By</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select involving member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedGroupMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>This expense is paid by</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input placeholder={"0"} type="number" {...field} />
              </FormControl>
              <FormDescription>This is expense amount.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select involving group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["USD", "EUR", "GBP", "MYR"].map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>This is expense currency.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Split</FormLabel>
          <Select value={splitMethod} onValueChange={setSplitMethod}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="How would you like to split the expense" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="1">Equaly among members</SelectItem>
              <SelectItem value="2">Custom split</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
        {splitMethod === "2" && (
          <div className="space-y-2">
            {activeMembers.map((member, index) => (
              <FormField
                key={member.id}
                control={form.control}
                name={`expenseSplits.${index}.amount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{member.name}</FormLabel>
                    <FormControl>
                      <Input placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Custom amount to split for {member.name}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        )}

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default ExpenseForm;
