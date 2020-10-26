import React, { useRef } from 'react';
import { BackHandler } from 'react-native';
import { WebView, WebViewProps } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';

import LoadingOverlay from '../LoadingOverlay';

const WebViewScreen: React.FC<WebViewProps> = ({ style, ...props }) => {
  const webRef = useRef<WebView>();

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

  return (
    <WebView
      {...props}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ref={webRef as any}
      style={[{ flex: 1 }, style]}
      allowFileAccess
      renderLoading={() => <LoadingOverlay />}
      allowUniversalAccessFromFileURLs
      originWhitelist={['*']}
      startInLoadingState
      onError={(err) => {
        console.error('Webview err', err);
      }}
    />
  );
};

export default WebViewScreen;
