import React, { useEffect, useState } from 'react';
import { Text, useTheme } from 'react-native-paper';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { styled, withTheme } from 'src/paperTheme';

const Container = withTheme(styled.View`
  background-color: ${({ theme }) => theme.colors.accent};
  flex-direction: row;
  align-items: center;
  justify-content: center;
`);

const ColoredText = withTheme(styled(Text)`
  color: ${({ theme }) => theme.colors.background};
  padding: 10px;
  text-align: center;
`);

const ConnectionBanner = () => {
  const theme = useTheme();
  const [connected, setConnected] = useState(true);

  const setNetworkStatus = ({ isInternetReachable, isConnected }: NetInfoState) => {
    setConnected(typeof isInternetReachable === 'boolean' ? isInternetReachable : isConnected);
  };

  useEffect(() => {
    void NetInfo.fetch().then(setNetworkStatus);

    const unsubscribe = NetInfo.addEventListener(setNetworkStatus);

    return unsubscribe;
  }, []);

  if (connected) {
    return null;
  }

  return (
    <Container>
      <MaterialIcons name="wifi" color={theme.colors.background} size={26} />
      <ColoredText>No internet connection</ColoredText>
    </Container>
  );
};

export default ConnectionBanner;
