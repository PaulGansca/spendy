import React, { useEffect, useState } from 'react';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  FlatList,
  Text,
  View,
  Alert,
  Platform,
} from 'react-native';
import { usePlaidStore, PlaidTransaction } from '@/store/plaidStore';
import { useUserStore } from '@/store/userStore';
import { TransactionListItem } from '@/components/TransactionListItem';

export default function App() {
  const { dailySpendGoal, weeklySpendGoal, monthlySpendGoal } = useUserStore(
    (state) => state,
  );
  const { accessToken, transactions, setTransactions } = usePlaidStore();
  const address = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!accessToken) {
        console.error('Access token is missing.');
        return;
      }

      try {
        const response = await fetch(
          `http://${address}:8000/api/transactions?access_token=${accessToken}`,
          {
            method: 'GET',
          },
        );

        if (!response.ok) {
          console.error('Failed to fetch transactions:', response.statusText);
          Alert.alert(
            'Error',
            'Unable to fetch transactions. Please try again.',
          );
          return;
        }

        const data = await response.json();
        if (data.transactions) {
          setTransactions(data.transactions); // Matches the updated key
        } else {
          console.error('Invalid response structure:', data);
          Alert.alert('Error', 'No transactions found. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        Alert.alert('Error', 'Unable to fetch transactions. Please try again.');
      }
    };
    fetchTransactions();
  }, [accessToken, address, setTransactions]);

  const [todaysTransactions, setTodaysTransactions] = useState<
    PlaidTransaction[]
  >([]);
  const [weeklyTransactions, setWeeklyTransactions] = useState<
    PlaidTransaction[]
  >([]);
  const [monthlyTransactions, setMonthlyTransactions] = useState<
    PlaidTransaction[]
  >([]);

  useEffect(() => {
    const today = new Date();
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
    const startOfThisMonth = startOfMonth(today);
    const endOfThisMonth = endOfMonth(today);

    // Handle weeks spanning two months
    const startOfPrevMonth = startOfMonth(startOfThisWeek);
    const lastDayOfPrevMonth = endOfMonth(startOfThisWeek);

    const weeklyStart =
      startOfThisWeek < startOfThisMonth ? startOfPrevMonth : startOfThisWeek;
    const weeklyEnd =
      endOfThisWeek > endOfThisMonth ? lastDayOfPrevMonth : endOfThisWeek;

    const todayTxns = transactions.filter((transaction) =>
      isSameDay(parseISO(transaction.date), today),
    );

    const weekTxns = transactions.filter((txn) =>
      isWithinInterval(parseISO(txn.date), {
        start: weeklyStart,
        end: weeklyEnd,
      }),
    );

    const monthTxns = transactions.filter((transaction) =>
      isWithinInterval(parseISO(transaction.date), {
        start: startOfThisMonth,
        end: endOfThisMonth,
      }),
    );

    setTodaysTransactions(todayTxns);
    setWeeklyTransactions(weekTxns);
    setMonthlyTransactions(monthTxns);
  }, [transactions]);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.goalsContainer}>
        <Text style={styles.goalText}>Daily Spend Goal: ${dailySpendGoal}</Text>
        <Text style={styles.goalText}>
          Weekly Spend Goal: ${weeklySpendGoal}
        </Text>
        <Text style={styles.goalText}>
          Monthly Spend Goal: ${monthlySpendGoal}
        </Text>
      </View>

      <View style={styles.listsContainer}>
        <Text style={styles.header}>Today's Transactions</Text>
        <FlatList
          data={todaysTransactions}
          keyExtractor={(item) => item.transaction_id}
          renderItem={({ item }) => <TransactionListItem item={item} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No transactions today</Text>
          }
        />

        <Text style={styles.header}>This Week's Transactions</Text>
        <FlatList
          data={weeklyTransactions}
          keyExtractor={(item) => item.transaction_id}
          renderItem={({ item }) => <TransactionListItem item={item} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No transactions this week</Text>
          }
        />

        <Text style={styles.header}>This Month's Transactions</Text>
        <FlatList
          data={monthlyTransactions}
          keyExtractor={(item) => item.transaction_id}
          renderItem={({ item }) => <TransactionListItem item={item} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No transactions this month</Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  goalsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  goalText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginVertical: 4,
  },
  listsContainer: {
    flex: 1,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    paddingBottom: 12,
  },
});
