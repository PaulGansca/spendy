import { StyleSheet, Button, Text, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { theme } from '@/theme';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { PlaidLinkComponent } from '@/components/PlaidLink';
import { usePlaidStore } from '@/store/plaidStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const toggleHasOnboarded = useUserStore((state) => state.toggleHasOnboarded);
  const setSpendGoals = useUserStore((state) => state.setSpendGoals);
  const isPlaidLinkSuccess = usePlaidStore((state) => state.linkSuccess);

  const [dailySpendGoal, setDailySpendGoal] = useState('');
  const [weeklySpendGoal, setWeeklySpendGoal] = useState('');
  const [monthlySpendGoal, setMonthlySpendGoal] = useState('');

  const handlePress = () => {
    setSpendGoals(dailySpendGoal, weeklySpendGoal, monthlySpendGoal);
    toggleHasOnboarded();
    router.replace('/');
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      style={styles.container}
    >
      <Text style={styles.label}>Daily Spend goal</Text>
      <TextInput
        value={dailySpendGoal}
        onChangeText={setDailySpendGoal}
        placeholder="E.g. 20$"
        style={styles.input}
        keyboardType="number-pad"
      />
      <Text style={styles.label}>Weekly Spend goal</Text>
      <TextInput
        value={weeklySpendGoal}
        onChangeText={setWeeklySpendGoal}
        placeholder="E.g. 200$"
        style={styles.input}
        keyboardType="number-pad"
      />
      <Text style={styles.label}>Monthly Spend goal</Text>
      <TextInput
        value={monthlySpendGoal}
        onChangeText={setMonthlySpendGoal}
        placeholder="E.g. 1000$"
        style={styles.input}
        keyboardType="number-pad"
      />
      <PlaidLinkComponent />
      <Button
        disabled={!isPlaidLinkSuccess}
        title="Complete Onboarding"
        onPress={handlePress}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorWhite,
  },
  contentContainer: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 100,
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    borderColor: theme.colorLightGrey,
    borderWidth: 2,
    padding: 12,
    borderRadius: 6,
    marginBottom: 24,
    fontSize: 18,
  },
});
