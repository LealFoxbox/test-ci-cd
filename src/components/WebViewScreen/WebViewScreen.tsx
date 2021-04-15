import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BackHandler, RefreshControl } from 'react-native';
import { WebView, WebViewNavigation, WebViewProps } from 'react-native-webview';
import { IconButton, Title, useTheme } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import RCTNetworking from 'react-native/Libraries/Network/RCTNetworking';
import { WebViewScrollEvent } from 'react-native-webview/lib/WebViewTypes';

import { useNetworkStatus } from 'src/utils/useNetworkStatus';
import usePrevious from 'src/utils/usePrevious';
import { logoutAction } from 'src/pullstate/actions';

import LoadingOverlay from '../LoadingOverlay';
import ConnectionBanner from '../ConnectionBanner';

import { Container, DisabledOverlay, MessageContainer, ScrollViewContainer } from './styles';

const setRenderEmpty = () => null;

function useCombinedRefs<T>(...refs: React.MutableRefObject<T | null>[]): React.MutableRefObject<T | null> {
  const targetRef = React.useRef<T>(null);

  React.useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === 'function') {
        // @ts-ignore
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}

const WebViewScreen = React.forwardRef<WebView, WebViewProps>(({ style, ...props }, ref) => {
  const [headerRight, setHeaderRight] = useState<() => React.ReactNode>(setRenderEmpty);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [enabledRefreshing, setEnabledRefreshing] = useState(true);

  const [showError, setShowError] = useState(false);
  const innerRef = useRef<WebView>(null);
  const webRef = useCombinedRefs<WebView>(
    ref as React.MutableRefObject<WebView | null>,
    innerRef as React.MutableRefObject<WebView | null>,
  );
  const connected = useNetworkStatus();
  const prevConnected = usePrevious(connected);
  const theme = useTheme();
  const navigation = useNavigation();

  const handleReload = () => {
    webRef.current?.reload();
    setShowError(false);
    setHeaderRight(setRenderEmpty);
  };

  const handleRefresh = () => {
    if (enabledRefreshing) {
      webRef.current?.reload();
      setShowError(false);
      setHeaderRight(setRenderEmpty);
      setIsRefreshing(true);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight,
    });
  }, [headerRight, navigation]);

  useFocusEffect(
    useCallback(() => {
      const handleBackButton = () => {
        webRef.current?.goBack();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', handleBackButton);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

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

  const handleScroll = useCallback(
    (event: WebViewScrollEvent) => {
      // contentOffset is the distance that the user has already scrolled from the beginning
      // we only enabling scroll in the beginning
      const { contentOffset } = event.nativeEvent;
      if (contentOffset.y === 0) {
        setEnabledRefreshing(true);
      } else {
        setEnabledRefreshing(false);
      }
    },
    [setEnabledRefreshing],
  );

  return (
    <ScrollViewContainer
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          enabled={enabledRefreshing && connected}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          tintColor="white"
          title="Loading..."
        />
      }
    >
      <Container style={style}>
        <ConnectionBanner connected={connected} />
        <Container>
          {!showError && (
            <WebView
              {...props}
              onLoadEnd={() => setIsRefreshing(false)}
              onScroll={handleScroll}
              ref={webRef}
              style={[{ flex: 1 }, style]}
              allowFileAccess
              renderLoading={() => <LoadingOverlay />}
              allowUniversalAccessFromFileURLs
              originWhitelist={['*']}
              startInLoadingState
              geolocationEnabled
              onNavigationStateChange={(params: WebViewNavigation) => {
                if (params.url.endsWith('.com/login')) {
                  void logoutAction();
                }
                props.onNavigationStateChange && props.onNavigationStateChange(params);
              }}
              onError={() => {
                setShowError(true);
                if (connected) {
                  setHeaderRight(() => (
                    <IconButton icon="refresh" onPress={handleReload} color={theme.colors.surface} size={24} />
                  ));
                } else {
                  setHeaderRight(setRenderEmpty);
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
    </ScrollViewContainer>
  );
});

export default WebViewScreen;
