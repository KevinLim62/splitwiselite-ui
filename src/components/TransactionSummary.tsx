import { Group } from "@/lib/state/groupStore";
import { useMemberStore } from "@/lib/state/memberStore";
import { Currency, Transaction } from "@/lib/state/transactionStore";
import { Checkbox } from "./ui/checkbox";

type TransactionSummaryProps = {
  group: Group;
  transactions: Transaction[];
};

const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  group,
  transactions,
}) => {
  const { members: friends } = useMemberStore();
  let memberNetAmount: {
    memberId: string;
    netAmount: Record<string, { spend: number; owe: number }>;
  }[] = group.members.map((member) => ({
    memberId: member,
    netAmount: {},
  }));

  transactions.forEach((transaction) => {
    if (transaction.type === "EXPENSE") {
      const paidMember = memberNetAmount.find(
        (member) => member.memberId === transaction.paidBy.id.toString()
      );

      // Initialize the currency object if it doesn't exist
      if (!paidMember!.netAmount[transaction.currency]) {
        paidMember!.netAmount[transaction.currency] = {
          spend: 0,
          owe: 0,
        };
      }

      // Update the spend amount
      paidMember!.netAmount[transaction.currency].spend += transaction.amount;

      memberNetAmount.forEach((member) => {
        if (
          transaction.expenseSplits &&
          transaction.expenseSplits.some(
            (split) => split.memberId.toString() === member.memberId
          )
        ) {
          const split = transaction.expenseSplits.find(
            (split) => split.memberId.toString() === member.memberId
          );

          // Initialize the currency object if it doesn't exist
          if (!member.netAmount[transaction.currency]) {
            member.netAmount[transaction.currency] = {
              spend: 0,
              owe: 0,
            };
          }

          // Update the owe amount
          member.netAmount[transaction.currency].owe += split!.amount;
        }
      });
    }
  });

  // Calculate net balance for each member (owe - spend)
  // const netBalances = Object.values(memberNetAmount).map((member) => ({
  //   memberId: member.memberId,
  //   balance: member.owe - member.spend,
  // }));

  // // Separate those who owe money from those who are owed
  // let oweList = netBalances
  //   .filter((member) => member.balance > 0)
  //   .map((member) => ({ ...member })); // Create a shallow copy

  // let owedList = netBalances
  //   .filter((member) => member.balance < 0)
  //   .map((member) => ({ ...member, balance: Math.abs(member.balance) })); // Create a shallow copy with positive balance

  // // Sort the lists to start settling the largest amounts first
  // oweList.sort((a, b) => b.balance - a.balance);
  // owedList.sort((a, b) => b.balance - a.balance);

  // const settlements: any[] = [];

  // // Settle balances
  // oweList.forEach((owe) => {
  //   while (owe.balance > 0 && owedList.length > 0) {
  //     const owed = owedList[0];

  //     const amountToSettle = Math.min(owe.balance, owed.balance);

  //     settlements.push({
  //       from: owe.memberId,
  //       to: owed.memberId,
  //       amount: amountToSettle,
  //     });

  //     owe.balance -= amountToSettle;
  //     owed.balance -= amountToSettle;

  //     // Remove from the owedList if fully settled
  //     if (owed.balance === 0) {
  //       owedList.shift();
  //     }
  //   }
  // });

  // Calculate net balances for each member by currency
  const netBalances = Object.values(memberNetAmount).flatMap((member) =>
    Object.entries(member.netAmount).map(([currency, amounts]) => ({
      memberId: member.memberId,
      currency: currency, // Type assertion
      balance: amounts.owe - amounts.spend,
    }))
  );

  // Separate those who owe money from those who are owed for each currency
  const settlements: any[] = [];

  const currencyGroups = netBalances.reduce((acc, member) => {
    const { currency } = member;
    if (!acc[currency]) {
      acc[currency] = { oweList: [], owedList: [] };
    }

    if (member.balance > 0) {
      acc[currency].oweList.push({ ...member });
    } else if (member.balance < 0) {
      acc[currency].owedList.push({
        ...member,
        balance: Math.abs(member.balance),
      });
    }

    return acc;
  }, {} as { [key in any]: { oweList: any[]; owedList: any[] } }); // Type assertion for currencyGroups

  // Sort and settle balances for each currency
  for (const currency in currencyGroups) {
    const { oweList, owedList } = currencyGroups[currency];

    // Sort the lists to start settling the largest amounts first
    oweList.sort((a, b) => b.balance - a.balance);
    owedList.sort((a, b) => b.balance - a.balance);

    // Settle balances for the current currency
    oweList.forEach((owe) => {
      while (owe.balance > 0 && owedList.length > 0) {
        const owed = owedList[0];

        const amountToSettle = Math.min(owe.balance, owed.balance);

        settlements.push({
          from: owe.memberId,
          to: owed.memberId,
          amount: amountToSettle,
          currency: currency, // Include currency in the settlement
          check: false,
        });

        owe.balance -= amountToSettle;
        owed.balance -= amountToSettle;

        // Remove from the owedList if fully settled
        if (owed.balance === 0) {
          owedList.shift();
        }
      }
    });
  }

  // settlements now contains all the settlements made for each currency
  //console.log("Settlements: ", settlements);

  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="font-bold text-base text-slate-800">Net balances :</h1>
      {netBalances.map((balance, index) => (
        <div key={index} className="text-slate-600 font-semibold">
          {`${
            friends.find((friend) => friend.id.toString() === balance.memberId)
              ?.name
          }:`}{" "}
          <span className="underline underline-offset-3 text-lg">
            {balance.balance.toFixed(2)} {balance.currency}{" "}
            {balance.balance === 0
              ? ""
              : balance.balance > 0
              ? "(owes)"
              : "(is owed)"}
          </span>
        </div>
      ))}

      <h1 className="font-bold text-base text-slate-800 pt-3">To Settle :</h1>
      {settlements.length > 0 ? (
        settlements.map((settlement, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-slate-600 font-semibold"
          >
            {/* <Checkbox /> */}
            {`${
              friends.find((friend) => friend.id.toString() === settlement.from)
                ?.name
            } should pay`}{" "}
            <span className="underline underline-offset-1 text-lg">
              {settlement.amount.toFixed(2)} {settlement.currency}
            </span>{" "}
            {`to ${
              friends.find((friend) => friend.id.toString() === settlement.to)
                ?.name
            }`}
          </div>
        ))
      ) : (
        <p>It is already settle among members</p>
      )}
    </div>
  );
};

export default TransactionSummary;
