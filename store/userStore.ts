import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type UserState = {
  hasFinishedOnboarding: boolean;
  dailySpendGoal: string;
  weeklySpendGoal: string;
  monthlySpendGoal: string;
  toggleHasOnboarded: () => void;
  setSpendGoals: (daily: string, weekly: string, monthly: string) => void;
};

export const useUserStore = create(
  persist<UserState>(
    (set) => ({
      hasFinishedOnboarding: false,
      dailySpendGoal: '',
      weeklySpendGoal: '',
      monthlySpendGoal: '',
      toggleHasOnboarded: () => {
        set((state) => ({
          hasFinishedOnboarding: !state.hasFinishedOnboarding,
        }));
      },
      setSpendGoals: (daily, weekly, monthly) => {
        set(() => ({
          dailySpendGoal: daily,
          weeklySpendGoal: weekly,
          monthlySpendGoal: monthly,
        }));
      },
    }),
    {
      name: 'spendy-user-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
