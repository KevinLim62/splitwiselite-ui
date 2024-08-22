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
import { useGroupStore } from "@/lib/state/groupStore";
import { useMemberStore } from "@/lib/state/memberStore";
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

export const expenseFormSchema = z.object({
  description: z.string({
    required_error: "Expense description is required",
  }),
  type: z.custom<"EXPENSE" | "PAYMENT">().default("EXPENSE"),
  groupId: z.string({ required_error: "Group Id is required" }),
  paidById: z.string({ required_error: "Paid By Id is required" }),
  paidToId: z.string({ required_error: "Paid By Id is required" }),
  amount: z.string({ required_error: "Amount is required" }),
  currency: z.custom<Currency>(),
});

type PaymentFormProps = {
  type: "CREATE" | "UPDATE";
  initialPaymentValue?: Transaction;
};

const PaymentForm: React.FC<PaymentFormProps> = ({
  type,
  initialPaymentValue,
}) => {
  const { transactions, addTransaction, editTransaction } =
    useTransactionStore();

  const { members } = useMemberStore();
  const { groups } = useGroupStore();

  const activeGroups = groups.filter((group) => group.isActive);
  const activeMembers = members.filter((members) => members.isActive);

  const form = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: initialPaymentValue ?? {
      description: "",
      type: "PAYMENT",
      groupId: "",
      paidById: "",
      paidToId: "",
      amount: "0",
      currency: "GBP",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof expenseFormSchema>) {
    const selectedGroup = activeGroups.find(
      (group) => group.id === parseInt(values.groupId)
    );

    if (values.paidById === values.paidToId) {
      alert("Please select different member to pay to.");
      return;
    }

    const selectedPaidBy = activeMembers.find(
      (member) => member.id === parseInt(values.paidById)
    );

    const selectedPaidTo = activeMembers.find(
      (member) => member.id === parseInt(values.paidToId)
    );

    if (!selectedGroup || !selectedPaidBy) {
      alert("Invalid group or paid by selected. Please check and try again.");
      return;
    }

    if (parseFloat(values.amount) < 0) {
      alert("Amount should not be negative.");
      return;
    }

    switch (type) {
      case "CREATE":
        addTransaction({
          ...values,
          id: transactions.length + 1,
          group: selectedGroup,
          paidBy: selectedPaidBy,
          paidTo: selectedPaidTo,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
        });
        break;

      case "UPDATE":
        editTransaction({
          ...values,
          id: initialPaymentValue!.id,
          group: selectedGroup,
          paidBy: selectedPaidBy,
          paidTo: selectedPaidTo,
          createdAt: initialPaymentValue!.createdAt,
          updatedAt: new Date().toISOString(),
          isActive: true,
        });
        break;

      default:
        break;
    }
  }

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
                  {activeMembers.map((member) => (
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
        <FormField
          control={form.control}
          name="paidToId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paid To</FormLabel>
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
                  {activeMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>This expense is paid to</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default PaymentForm;
