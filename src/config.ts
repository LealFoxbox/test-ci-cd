import { Platform } from 'react-native';
import Config from 'react-native-config';
import { getBuildNumber, getDeviceId, getDeviceName, getVersion } from 'react-native-device-info';

type Env = 'dev' | 'staging' | 'production';

const { SENTRY_DSN, BACKEND_BASE_URL, BACKEND_API_URL, RELEASE_VERSION, APP_ENV, BUILD_ID } = Config;

interface Config {
  isDev: boolean;
  ENV: Env;
  APP_VERSION: string;
  DEVICE_ID: string;
  DEVICE_NAME: string;
  RELEASE_VERSION: string;
  BUILD_ID: string;
  SENTRY_DSN: string;
  BACKEND_BASE_URL: string;
  BACKEND_API_URL: string;
}

const config: Config = {
  isDev: __DEV__,
  ENV: __DEV__ ? 'dev' : (APP_ENV as Env) || 'dev',
  APP_VERSION: `${Platform.OS} v${getVersion()} (${getBuildNumber()})`,
  DEVICE_ID: getDeviceId(),
  DEVICE_NAME: 'default name',
  RELEASE_VERSION,
  BUILD_ID,
  SENTRY_DSN,
  BACKEND_BASE_URL,
  BACKEND_API_URL,
};

export const getConfigPromise = Promise.all([
  getDeviceName()
    .then((name) => {
      config.DEVICE_NAME = name;
    })
    .catch((e) => {
      console.error(e);
    }),
]);

export default config;
