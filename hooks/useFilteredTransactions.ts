import { useState, useEffect } from 'react';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { PlaidTransaction, usePlaidStore } from '@/store/plaidStore';
import { useUserStore } from '@/store/userStore';

export const useFilteredTransactions = (
  selectedPeriod: 'daily' | 'weekly' | 'monthly',
) => {
  const { transactions } = usePlaidStore();
  const { dailySpendGoal, weeklySpendGoal, monthlySpendGoal } = useUserStore();
  const [filteredTransactions, setFilteredTransactions] = useState<
    PlaidTransaction[]
  >([]);
  const [spent, setSpent] = useState(0);
  const [goal, setGoal] = useState(0);

  useEffect(() => {
    const today = new Date();

    const filters = {
      daily: transactions.filter((t) => isSameDay(parseISO(t.date), today)),
      weekly: transactions.filter((t) =>
        isWithinInterval(parseISO(t.date), {
          start: startOfWeek(today, { weekStartsOn: 1 }),
          end: endOfWeek(today, { weekStartsOn: 1 }),
        }),
      ),
      monthly: transactions.filter((t) =>
        isWithinInterval(parseISO(t.date), {
          start: startOfMonth(today),
          end: endOfMonth(today),
        }),
      ),
    };

    const periodTransactions = filters[selectedPeriod];
    const totalSpent = Math.abs(
      periodTransactions.reduce((sum, txn) => sum + txn.amount, 0),
    );

    setFilteredTransactions(periodTransactions);
    setSpent(totalSpent);
    setGoal(
      Number(
        {
          daily: dailySpendGoal,
          weekly: weeklySpendGoal,
          monthly: monthlySpendGoal,
        }[selectedPeriod],
      ),
    );
  }, [
    transactions,
    selectedPeriod,
    dailySpendGoal,
    weeklySpendGoal,
    monthlySpendGoal,
  ]);

  return { filteredTransactions, spent, goal };
};
