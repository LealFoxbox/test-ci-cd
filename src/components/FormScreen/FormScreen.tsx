import React, { useEffect, useRef, useState } from 'react';
import { WebView, WebViewNavigation, WebViewProps } from 'react-native-webview';
import { IconButton, Title, useTheme } from 'react-native-paper';
// @ts-ignore
import RCTNetworking from 'react-native/Libraries/Network/RCTNetworking';

import { useNetworkStatus } from 'src/utils/useNetworkStatus';
import usePrevious from 'src/utils/usePrevious';
import { logoutAction } from 'src/pullstate/persistentStore';

import LoadingOverlay from '../LoadingOverlay';
import ConnectionBanner from '../ConnectionBanner';

import { Container, DisabledOverlay, MessageContainer } from './styles';

function updateRenderRight(cb: any) {}

const FormSCreen: React.FC<WebViewProps> = ({ style, ...props }) => {
  const [showError, setShowError] = useState(false);
  const webRef = useRef<WebView>(null);
  const connected = useNetworkStatus();
  const prevConnected = usePrevious(connected);
  const theme = useTheme();

  const handleReload = () => {
    webRef.current?.reload();
    setShowError(false);
    updateRenderRight(() => null);
  };

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
                void logoutAction();
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

export default FormSCreen;
