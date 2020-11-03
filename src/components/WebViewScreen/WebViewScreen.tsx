import React, { useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { WebView, WebViewNavigation, WebViewProps } from 'react-native-webview';
import { IconButton, Title, useTheme } from 'react-native-paper';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
// @ts-ignore
import RCTNetworking from 'react-native/Libraries/Network/RCTNetworking';

import { useNetworkStatus } from 'src/utils/useNetworkStatus';
import { TicketsNavigatorParamList } from 'src/navigation/TicketsNavigator';
import { TICKETS_HOME } from 'src/navigation/screenNames';
import { useUserSession } from 'src/contexts/userSession';
import usePrevious from 'src/utils/usePrevious';

import LoadingOverlay from '../LoadingOverlay';
import ConnectionBanner from '../ConnectionBanner';

import { Container, DisabledOverlay, MessageContainer } from './styles';

const WebViewScreen: React.FC<WebViewProps> = ({ style, ...props }) => {
  const {
    params: { updateRenderRight },
  } = useRoute<RouteProp<TicketsNavigatorParamList, typeof TICKETS_HOME>>();

  const [showError, setShowError] = useState(false);
  const webRef = useRef<WebView>(null);
  const connected = useNetworkStatus();
  const prevConnected = usePrevious(connected);
  const [, dispatch] = useUserSession();
  const theme = useTheme();

  const handleReload = () => {
    webRef.current?.reload();
    setShowError(false);
    updateRenderRight(() => null);
  };

  useFocusEffect(() => {
    const handleBackButton = () => {
      webRef.current?.goBack();
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  });

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
            onNavigationStateChange={({ url }: WebViewNavigation) => {
              if (url.endsWith('.com/login')) {
                dispatch({ type: 'logout' });
              }
            }}
            onError={() => {
              setShowError(true);
              if (connected) {
                updateRenderRight(() => (
                  <IconButton icon="refresh" onPress={handleReload} theme={theme} color={theme.colors.text} size={24} />
                ));
              } else {
                updateRenderRight(() => null);
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

export default WebViewScreen;
