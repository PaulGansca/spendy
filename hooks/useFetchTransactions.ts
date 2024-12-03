import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { usePlaidStore } from '@/store/plaidStore';

export const useFetchTransactions = () => {
  const { accessToken, setTransactions } = usePlaidStore();
  const address = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!accessToken) return console.error('Access token is missing.');
      try {
        const response = await fetch(
          `http://${address}:8000/api/transactions?access_token=${accessToken}`,
        );
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        if (data.transactions) {
          setTransactions(data.transactions);
        } else {
          Alert.alert('Error', 'No transactions found.');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        Alert.alert('Error', 'Unable to fetch transactions. Please try again.');
      }
    };
    fetchTransactions();
  }, [accessToken, address, setTransactions]);
};
