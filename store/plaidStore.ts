import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type PlaidState = {
  accessToken: string | null;
  itemId: string | null;
  isItemAccess: boolean;
  linkSuccess: boolean;
  transactions: PlaidTransaction[];
  setPlaidData: (data: { accessToken: string; itemId: string }) => void;
  setTransactions: (transactions: PlaidTransaction[]) => void;
  resetPlaidState: () => void;
};

export interface PlaidTransaction {
  account_id: string;
  account_owner: string | null;
  amount: number;
  authorized_date: string | null;
  authorized_datetime: string | null;
  category: string[];
  category_id: string;
  check_number: string | null;
  counterparties: any[]; // Replace `any` with the actual type if you have more details about the counterparties
  date: string;
  datetime: string | null;
  iso_currency_code: string | null;
  location: {
    address: string | null;
    city: string | null;
    country: string | null;
    lat: number | null;
    lon: number | null;
    postal_code: string | null;
    region: string | null;
    store_number: string | null;
  };
  logo_url: string | null;
  merchant_entity_id: string | null;
  merchant_name: string | null;
  name: string;
  payment_channel: 'online' | 'in store' | 'other';
  payment_meta: {
    by_order_of: string | null;
    payee: string | null;
    payer: string | null;
    payment_method: string | null;
    payment_processor: string | null;
    ppd_id: string | null;
    reason: string | null;
    reference_number: string | null;
  };
  pending: boolean;
  pending_transaction_id: string | null;
  personal_finance_category: {
    confidence_level: 'VERY_HIGH' | 'HIGH' | 'LOW' | null;
    detailed: string;
    primary: string;
  } | null;
  personal_finance_category_icon_url: string | null;
  transaction_code: string | null;
  transaction_id: string;
  transaction_type: 'place' | 'special' | 'other' | string; // Add more specific types if known
  unofficial_currency_code: string | null;
  website: string | null;
}

export const usePlaidStore = create(
  persist<PlaidState>(
    (set) => ({
      accessToken: null,
      itemId: null,
      isItemAccess: false,
      linkSuccess: false,
      transactions: [],
      setPlaidData: (data) =>
        set({
          accessToken: data.accessToken,
          itemId: data.itemId,
          isItemAccess: true,
          linkSuccess: true,
        }),
      setTransactions: (transactions) => set({ transactions }),
      resetPlaidState: () =>
        set({
          accessToken: null,
          itemId: null,
          isItemAccess: false,
          linkSuccess: false,
          transactions: [],
        }),
    }),
    { name: 'plaid-store', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
