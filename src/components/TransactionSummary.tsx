import { Group } from "@/lib/state/groupStore";
import { useMemberStore } from "@/lib/state/memberStore";
import { Transaction } from "@/lib/state/transactionStore";

type TransactionSummaryProps = {
  group: Group;
  transactions: Transaction[];
};

const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  group,
  transactions,
}) => {
  const { members: friends } = useMemberStore();
  // TODO: Implement logic to calculate total amount owed, etc.
  let memberNetAmount = group.members.map((member) => ({
    memberId: member,
    spend: 0,
    owe: 0,
  }));

  transactions.forEach((transaction) => {
    if (transaction.type === "EXPENSE") {
      const paidMember = memberNetAmount.find(
        (member) => member.memberId === transaction.paidBy.id.toString()
      );
      paidMember!.spend += +transaction.amount;

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
          member.owe += split!.amount;
        }
      });
    }
  });

  // Calculate net balance for each member (owe - spend)
  const netBalances = Object.values(memberNetAmount).map((member) => ({
    memberId: member.memberId,
    balance: member.owe - member.spend,
  }));

  // Separate those who owe money from those who are owed
  let oweList = netBalances.filter((member) => member.balance > 0);
  let owedList = netBalances
    .filter((member) => member.balance < 0)
    .map((member) => ({
      ...member,
      balance: Math.abs(member.balance), // Make balance positive for easier calculation
    }));

  // Sort the lists to start settling the largest amounts first
  oweList.sort((a, b) => b.balance - a.balance);
  owedList.sort((a, b) => b.balance - a.balance);

  const settlements: any[] = [];

  // Settle balances
  oweList.forEach((owe) => {
    while (owe.balance > 0 && owedList.length > 0) {
      const owed = owedList[0];

      const amountToSettle = Math.min(owe.balance, owed.balance);

      settlements.push({
        from: owe.memberId,
        to: owed.memberId,
        amount: amountToSettle,
      });

      owe.balance -= amountToSettle;
      owed.balance -= amountToSettle;

      // Remove from the owedList if fully settled
      if (owed.balance === 0) {
        owedList.shift();
      }
    }
  });

  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="font-bold text-base">To Settle :</h1>
      {settlements.length > 0 ? (
        settlements.map((settlement, index) => (
          <div key={index} className="text-slate-600 font-semibold">
            {`${
              friends.find((friend) => friend.id.toString() === settlement.from)
                ?.name
            } should pay`}{" "}
            <span className="underline underline-offset-1 text-lg">
              {settlement.amount}
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
