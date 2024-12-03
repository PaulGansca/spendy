import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { PlaidTransaction } from '@/store/plaidStore';

export const TransactionListItem = ({ item }: { item: PlaidTransaction }) => {
  return (
    <View style={styles.transaction}>
      <Image source={{ uri: item.logo_url || undefined }} style={styles.logo} />
      <View style={styles.details}>
        <Text numberOfLines={1} style={styles.transactionName}>
          {item.name}
        </Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text style={styles.transactionAmount}>${item.amount.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignSelf: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
    gap: 8,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    paddingRight: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e88e5',
  },
});
