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
import { Member, useMemberStore } from "@/lib/state/memberStore";
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
import { Checkbox } from "./ui/checkbox";
import { useToast } from "./ui/use-toast";
import { currencyCodes } from "@/lib/utils";

export const expenseFormSchema = z.object({
  description: z.string({
    required_error: "Expense description is required",
  }),
  type: z.custom<"EXPENSE" | "PAYMENT">().default("EXPENSE"),
  groupId: z.string({ required_error: "Group Id is required" }),
  paidById: z.string({ required_error: "Paid By Id is required" }),
  expenseSplits: z.array(z.any()),
  equalSplits: z.array(z.string()),
  splitMethod: z.string().default("1"),
  amount: z.coerce.number({ required_error: "Amount is required" }).min(0),
  currency: z.custom<Currency>(),
});

type ExpenseFormProps = {
  type: "CREATE" | "UPDATE";
  initialExpenseValue?: Transaction;
  onClose: () => void;
};

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  type,
  initialExpenseValue,
  onClose,
}) => {
  const { toast } = useToast();
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
      equalSplits: [],
      amount: 0,
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
      toast({
        title: "Invalid group or paid by selected. Please check and try again",
        variant: "destructive",
      });
      return;
    }

    if (values.amount < 0) {
      toast({
        title: "Amount should not be negative.",
        variant: "destructive",
      });
      return;
    }

    let formattedExpenseSplits;
    if (splitMethod === "1" && selectedGroupMembers) {
      //Equally split the expense amount
      const splitAmount = values.amount / values.equalSplits.length;

      formattedExpenseSplits = selectedGroupMembers.map((member) => ({
        memberId: member.id,
        name: member.name,
        amount: values.equalSplits.includes(member.id.toString())
          ? splitAmount
          : 0,
      }));
    } else if (splitMethod === "2" && selectedGroupMembers) {
      let amount = 0;
      for (let index = 0; index < values.expenseSplits.length; index++) {
        amount += parseFloat(values.expenseSplits[index].amount);
        if (amount > values.amount) {
          toast({
            title: "Total split amount should not exceed the expense amount.",
            variant: "destructive",
          });
          return;
        }
      }

      if (amount !== values.amount) {
        toast({
          title: "Total split amount should be equal to the expense amount.",
          variant: "destructive",
        });
        return;
      }

      //Custom split the expense amount
      formattedExpenseSplits = values.expenseSplits.map((expense, index) => ({
        memberId: members[index].id,
        name: members[index].name,
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

    toast({
      title: `Expense ${type.toLowerCase()} successfully !`,
      variant: "success",
    });

    onClose();
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
              <FormControl className="text-base">
                <Input placeholder="Expense description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl className="text-base">
                <Input disabled placeholder="type" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
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
                    <SelectValue
                      placeholder="Select involving group"
                      className="text-base"
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activeGroups.map((group) => (
                    <SelectItem
                      key={group.id}
                      value={group.id.toString()}
                      className="text-base"
                    >
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                      <SelectValue
                        placeholder="Select involving member"
                        className="text-base"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedGroupMembers.map((member) => (
                      <SelectItem
                        key={member.id}
                        value={member.id.toString()}
                        className="text-base"
                      >
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <FormControl className="text-base">
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
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
                    <SelectValue
                      placeholder="Select currency"
                      className="text-base"
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* TODO Currency */}
                  {currencyCodes.map((currency) => (
                    <SelectItem
                      key={currency}
                      value={currency}
                      className="text-base"
                    >
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Split</FormLabel>
          <Select value={splitMethod} onValueChange={setSplitMethod}>
            <FormControl>
              <SelectTrigger>
                <SelectValue
                  placeholder="How would you like to split the expense"
                  className="text-base"
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem className="text-base" value="1">
                Equally among selected members
              </SelectItem>
              <SelectItem className="text-base" value="2">
                Custom
              </SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
        {splitMethod === "1" && (
          <div className="space-y-2">
            <h1>Select members to split equally</h1>
            {selectedGroupMembers && selectedGroupMembers.map((member) => (
              <FormField
                key={member.id}
                control={form.control}
                name="equalSplits"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl className="text-base">
                        <Checkbox
                          checked={field.value?.includes(member.id.toString())}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([
                                  ...field.value,
                                  member.id.toString(),
                                ])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== member.id.toString()
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {member.name}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
        )}
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
                    <FormControl className="text-base">
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
