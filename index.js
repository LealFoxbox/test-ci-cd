/* eslint-disable no-console */
import { AppRegistry } from 'react-native';
import 'react-native-gesture-handler';
import Flurry from 'react-native-flurry-sdk';
import * as Sentry from '@sentry/react-native';

import config from 'src/config';

import App from './src/App';

// Init Flurry once as early as possible recommended in index.js.
// For each platform (Android, iOS) where the app runs you need to acquire a unique Flurry API Key.
// i.e., you need two API keys if you are going to release the app on both Android and iOS platforms.
// If you are building for TV platforms, you will need two API keys for Android TV and tvOS.
new Flurry.Builder()
  .withCrashReporting(true)
  .withLogEnabled(true)
  .withLogLevel(Flurry.LogLevel.DEBUG)
  .build('6QVMX8CVBTYZ9S7S5SRG'); //, FLURRY_IOS_API_KEY);

if (config.isDev) {
  // Whenever we use console.error, we get a red box on the phone, but no output to the console. Let's monkeypatch
  // console.error to fix this.
  const consoleError = console.error;
  console.error = function (...args) {
    console.log('\x1b[45mERROR:', ...args, '\x1b[0m'); // Using a magenta background because it looks cool. If you prefer old boring red, change [45m to [41m
    consoleError.apply(console, args);
  };
}

Sentry.init({
  dsn: 'https://baa11a89e28842559010058d6cea2634@o88422.ingest.sentry.io/5550845',
  debug: config.isDev,
});

AppRegistry.registerComponent(config.APP_NAME, () => App);
