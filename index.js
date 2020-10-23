/* eslint-disable */
import { AppRegistry } from 'react-native';
import * as Sentry from '@sentry/react-native';

import config from 'src/config';

import App from './src/App';
import { name as appName } from './app.json';

if (config.isDev) {
  // Whenever we use console.error, we get a red box on the phone, but no output to the console. Let's monkeypatch
  // console.error to fix this.
  const consoleError = console.error;
  console.error = function (...args) {
    console.log('\x1b[45mERROR:', ...args, '\x1b[0m'); // Using a magenta background because it looks cool. If you prefer old boring red, change [45m to [41m
    consoleError.apply(console, args);
  };
} else {
  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: 'production',
    dist: DeviceInfo.getBuildNumber(),
    release: `${DeviceInfo.getBundleId()}-${DeviceInfo.getVersion()}`,
  });
}

AppRegistry.registerComponent(appName, () => App);
