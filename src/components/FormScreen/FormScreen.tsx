import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { WebView, WebViewNavigation, WebViewProps } from 'react-native-webview';
import { IconButton, Title, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
// @ts-ignore
import RCTNetworking from 'react-native/Libraries/Network/RCTNetworking';

import { useNetworkStatus } from 'src/utils/useNetworkStatus';
import usePrevious from 'src/utils/usePrevious';
import { logoutAction } from 'src/pullstate/persistentStore';

import LoadingOverlay from '../LoadingOverlay';
import ConnectionBanner from '../ConnectionBanner';

import { Container, DisabledOverlay, MessageContainer } from './styles';

const EmptyRender = () => null;

const FormSCreen: React.FC<WebViewProps> = ({ style, ...props }) => {
  const [headerRight, setHeaderRight] = useState<() => React.ReactNode>(() => EmptyRender);
  const [showError, setShowError] = useState(false);
  const [nextScreen, setNextScreen] = useState<'logout' | 'back' | null>(null);
  const webRef = useRef<WebView>(null);
  const connected = useNetworkStatus();
  const prevConnected = usePrevious(connected);
  const navigation = useNavigation();
  const theme = useTheme();

  const handleReload = () => {
    webRef.current?.reload();
    setShowError(false);
    setHeaderRight(() => EmptyRender);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight,
    });
  }, [headerRight, navigation]);

  // note: we use nextScreen instead of navigating directly to prevent multiple triggers
  useEffect(() => {
    if (nextScreen === 'logout') {
      void logoutAction();
    } else if (nextScreen === 'back') {
      navigation.goBack();
    }
  }, [nextScreen, navigation]);

  useEffect(() => {
    if (!prevConnected && connected && showError) {
      handleReload();
    }
    // We need the deps to be just connected because we only care when it s being updated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  useEffect(() => {
    // here we disable cookies because the backend sends us set cookie headers and we don't need them
    // in fact, they keep us signed in even if we send the wrong auth token in the GET params
    RCTNetworking.clearCookies(() => undefined);
  }, []);

  return (
    <Container style={style}>
      <ConnectionBanner connected={connected} />
      <Container>
        {!showError && (
          <WebView
            {...props}
            ref={webRef}
            style={[{ flex: 1 }, style]}
            allowFileAccess
            renderLoading={() => <LoadingOverlay />}
            allowUniversalAccessFromFileURLs
            originWhitelist={['*']}
            startInLoadingState
            geolocationEnabled
            onNavigationStateChange={({ url }: WebViewNavigation) => {
              if (url.endsWith('.com/login')) {
                setNextScreen('logout');
              } else if (!url.includes('inspection_forms')) {
                setNextScreen('back');
              }
            }}
            onError={() => {
              setShowError(true);
              if (connected) {
                setHeaderRight(() => () => (
                  <IconButton icon="refresh" onPress={handleReload} theme={theme} color={theme.colors.text} size={24} />
                ));
              } else {
                setHeaderRight(() => EmptyRender);
              }
            }}
          />
        )}
        {showError && connected && (
          <MessageContainer>
            <Title style={{ textAlign: 'center' }}>An error ocurred, please reload</Title>
          </MessageContainer>
        )}
        {!connected && <DisabledOverlay />}
      </Container>
    </Container>
  );
};

export default FormSCreen;
