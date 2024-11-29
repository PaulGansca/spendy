import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  FlatList,
  Text,
  View,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { usePlaidStore } from '@/store/plaidStore';
import { theme } from '@/theme';
import { useUserStore } from '@/store/userStore';

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
  }, [accessToken, setTransactions]);
  console.log(transactions);
  if (!transactions.length) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  return (
    <View style={styles.container}>
      <Text>Daily Spend Goal: {dailySpendGoal}</Text>
      <Text>Weekly Spend Goal: {weeklySpendGoal}</Text>
      <Text>Monthly Spend Goal: {monthlySpendGoal}</Text>
      <StatusBar style="auto" />
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.transaction_id}
        renderItem={({ item }) => (
          <View style={{ padding: 16 }}>
            <Text>{item.name}</Text>
            <Text>${item.amount}</Text>
            <Text>{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
