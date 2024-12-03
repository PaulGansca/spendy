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
  TouchableOpacity,
} from 'react-native';
import { usePlaidStore, PlaidTransaction } from '@/store/plaidStore';
import { useUserStore } from '@/store/userStore';
import { TransactionListItem } from '@/components/TransactionListItem';
import { Rings, RING_SIZE } from '@/components/Rings';
import ProgressText from '@/components/AnimatedProgressText';

export default function App() {
  const { dailySpendGoal, weeklySpendGoal, monthlySpendGoal } = useUserStore(
    (state) => state,
  );
  const { accessToken, transactions, setTransactions } = usePlaidStore();
  const address = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';

  const [selectedPeriod, setSelectedPeriod] = useState<
    'daily' | 'weekly' | 'monthly'
  >('daily');
  const [spent, setSpent] = useState(0);
  const [goal, setGoal] = useState<number>(Number(dailySpendGoal));
  const [filteredTransactions, setFilteredTransactions] = useState<
    PlaidTransaction[]
  >([]);

  const [animationStarted, setAnimationStarted] = useState(true);

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

    // Handle the selected period change
    let filteredTransactions = [];
    let periodGoal = 0;

    switch (selectedPeriod) {
      case 'daily':
        filteredTransactions = todayTxns;
        periodGoal = Number(dailySpendGoal); // Ensure it's a number
        break;
      case 'weekly':
        filteredTransactions = weekTxns;
        periodGoal = Number(weeklySpendGoal); // Ensure it's a number
        break;
      case 'monthly':
        filteredTransactions = monthTxns;
        periodGoal = Number(monthlySpendGoal); // Ensure it's a number
        break;
    }

    // Sum the amounts for the selected period
    const totalSpent = Math.abs(
      filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0),
    );

    setFilteredTransactions(filteredTransactions); // Store the filtered transactions
    setSpent(totalSpent);
    setGoal(periodGoal); // Set the correct goal for the selected period
  }, [
    transactions,
    selectedPeriod,
    dailySpendGoal,
    weeklySpendGoal,
    monthlySpendGoal,
  ]);

  const duration =
    (spent / goal < 0.5 ? 800 : 2000) + Math.ceil(spent / goal) * 1000;

  const handleSelectPeriod = (period: 'daily' | 'weekly' | 'monthly') => {
    setSelectedPeriod(period);
    setAnimationStarted(false); // Reset animation before starting new selection
    setTimeout(() => {
      setAnimationStarted(true); // Start animation after the period change
    }, 50); // Short delay to ensure re-render
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Period Selectable Badges */}
      <View style={styles.badgeContainer}>
        {['daily', 'weekly', 'monthly'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.badge,
              selectedPeriod === period && styles.selectedBadge,
            ]}
            onPress={() =>
              handleSelectPeriod(period as 'daily' | 'weekly' | 'monthly')
            }
          >
            <Text style={styles.badgeText}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Rings and ProgressText */}
      <View style={styles.chartContainer}>
        <Rings
          goal={goal}
          spent={spent}
          duration={duration}
          startAnimation={animationStarted}
        />
        <ProgressText duration={duration} spent={spent} goal={goal} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.listsContainer}>
          <Text style={styles.header}>
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}'s
            Transactions
          </Text>
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.transaction_id}
            renderItem={({ item }) => <TransactionListItem item={item} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No transactions this {selectedPeriod}
              </Text>
            }
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
    gap: 16,
  },
  badge: {
    backgroundColor: '#ddd',
    padding: 8,
    borderRadius: 12,
  },
  selectedBadge: {
    backgroundColor: '#388e3c',
  },
  badgeText: {
    color: '#fff',
    fontSize: 16,
  },
  contentContainer: { paddingHorizontal: 16, paddingVertical: 8, flex: 1 },
  chartContainer: {
    height: RING_SIZE + 14,
    position: 'relative',
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
