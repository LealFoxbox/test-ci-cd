import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    let mounted = true;

    const setNetworkStatus = ({ isInternetReachable, isConnected }: NetInfoState) => {
      mounted && setConnected(typeof isInternetReachable === 'boolean' ? isInternetReachable : isConnected);
    };

    void NetInfo.fetch().then(setNetworkStatus);

    const unsubscribe = NetInfo.addEventListener(setNetworkStatus);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return connected;
};

export const hasConnection = async () => {
  const { isInternetReachable, isConnected } = await NetInfo.fetch();
  return typeof isInternetReachable === 'boolean' ? isInternetReachable : isConnected;
};

export const waitForConnection = async () => {
  const result = await hasConnection();

  if (result) {
    return;
  }

  return new Promise<void>((resolve) => {
    let unsub: NetInfoSubscription | null = null;

    const setNetworkStatus = ({ isInternetReachable, isConnected }: NetInfoState) => {
      const connected = typeof isInternetReachable === 'boolean' ? isInternetReachable : isConnected;
      if (connected && unsub) {
        unsub();
        resolve();
      }
    };

    unsub = NetInfo.addEventListener(setNetworkStatus);
  });
};
