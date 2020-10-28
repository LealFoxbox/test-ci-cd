import React, { useRef } from 'react';
import { BackHandler, View } from 'react-native';
import { WebView, WebViewProps } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';

import LoadingOverlay from '../LoadingOverlay';
import ConnectionBanner from '../ConnectionBanner';

const WebViewScreen: React.FC<WebViewProps> = ({ style, ...props }) => {
  const webRef = useRef<WebView>(null);

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
    <View style={[{ flex: 1 }, style]}>
      <ConnectionBanner />
      <WebView
        {...props}
        ref={webRef}
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
    </View>
  );
};

export default WebViewScreen;
