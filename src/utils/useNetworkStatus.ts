import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const setNetworkStatus = ({ isInternetReachable, isConnected }: NetInfoState) => {
      setConnected(typeof isInternetReachable === 'boolean' ? isInternetReachable : isConnected);
    };

    void NetInfo.fetch().then(setNetworkStatus);

    const unsubscribe = NetInfo.addEventListener(setNetworkStatus);

    return unsubscribe;
  }, []);

  return connected;
};
