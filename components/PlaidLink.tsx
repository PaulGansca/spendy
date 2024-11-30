import React, { useEffect, useState, useCallback } from 'react';
import {
  Text,
  ActivityIndicator,
  Alert,
  Button,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  create,
  open,
  dismissLink,
  LinkSuccess,
  LinkExit,
  LinkIOSPresentationStyle,
  LinkLogLevel,
} from 'react-native-plaid-link-sdk';
import { usePlaidStore } from '@/store/plaidStore';

export const PlaidLinkComponent = () => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const { setPlaidData, linkSuccess } = usePlaidStore();
  const address = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';

  // Fetch the link token from your backend
  const fetchLinkToken = useCallback(async () => {
    try {
      const response = await fetch(
        `http://${address}:8000/api/create_link_token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
      );
      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (error) {
      console.error('Error fetching link token:', error);
      Alert.alert('Error', 'Unable to initialize Plaid. Please try again.');
    }
  }, [address]);

  // Exchange the public token for an access token
  const handleSuccess = useCallback(
    async (success: LinkSuccess) => {
      try {
        const response = await fetch(
          `http://${address}:8000/api/set_access_token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_token: success.publicToken }),
          },
        );
        const data = await response.json();

        if (data.access_token) {
          setPlaidData({
            accessToken: data.access_token,
            itemId: data.item_id,
          });
          Alert.alert('Success', 'Bank account linked successfully!');
        } else {
          throw new Error('Failed to exchange public token.');
        }
      } catch (error) {
        console.error('Error exchanging public token:', error);
        Alert.alert('Error', 'Unable to complete linking. Please try again.');
      }
    },
    [address, setPlaidData],
  );

  // Create the link token configuration
  const createLinkTokenConfiguration = useCallback(
    (token: string) => ({
      token,
      noLoadingState: false,
    }),
    [],
  );

  useEffect(() => {
    if (linkToken == null) {
      fetchLinkToken();
    } else {
      const tokenConfiguration = createLinkTokenConfiguration(linkToken);
      create(tokenConfiguration);
    }
  }, [linkToken, fetchLinkToken, createLinkTokenConfiguration]);

  // Open the Plaid Link flow
  const handleOpenLink = () => {
    const openProps = {
      onSuccess: handleSuccess,
      onExit: (exit: LinkExit) => {
        console.log('Plaid Link exited:', exit);
        dismissLink();
      },
      iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
      logLevel: LinkLogLevel.ERROR,
    };
    open(openProps);
  };

  if (!linkToken) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Link Your Bank Account</Text>
      <Button
        disabled={linkSuccess}
        title="Open Plaid Link"
        onPress={handleOpenLink}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
