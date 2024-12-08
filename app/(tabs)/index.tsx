import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  FlatList,
  Text,
  View,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { TransactionListItem } from '@/components/TransactionListItem';
import { Rings, RING_SIZE } from '@/components/Rings';
import ProgressText from '@/components/AnimatedProgressText';
import { useFetchTransactions } from '@/hooks/useFetchTransactions';
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';
import { getItem, reloadAll, setItem } from '@/modules/widget';

const GROUP_NAME = 'group.com.paulg129.spendy.widget';

const getSharedData = getItem(GROUP_NAME);
const setSharedData = setItem(GROUP_NAME);

function Button({ onPress, title }: any) {
  return (
    <Pressable style={{}} onPress={onPress}>
      <Text style={{}}>{title}</Text>
    </Pressable>
  );
}

export default function App() {
  const [value, setValue] = useState(getSharedData(GROUP_NAME) ?? '');
  useFetchTransactions();
  useEffect(() => {
    setSharedData('savedData', value);
    reloadAll();
  }, [value]);

  const onPress = () => {
    console.log('SHOOT');
    setValue(`${spent} $ / ${goal} $`);
  };

  const clear = () => {
    setValue('');
  };

  const [selectedPeriod, setSelectedPeriod] = useState<
    'daily' | 'weekly' | 'monthly'
  >('daily');
  const { filteredTransactions, spent, goal } =
    useFilteredTransactions(selectedPeriod);
  const [animationStarted, setAnimationStarted] = useState(true);

  const duration =
    (spent / goal < 0.4 ? 500 : 2000) + Math.ceil(spent / goal) * 1000;

  const handleSelectPeriod = (period: 'daily' | 'weekly' | 'monthly') => {
    setSelectedPeriod(period);
    setAnimationStarted(false);
    setTimeout(() => setAnimationStarted(true), 50);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
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
        <View>
          <Button onPress={onPress} title="Set value" />
          <Button onPress={clear} title="Clear" />
        </View>
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
