import { Platform } from 'react-native';
import { getBuildNumber, getDeviceId, getDeviceName, getVersion } from 'react-native-device-info';

const stagingBaseurl = 'orangeqc-staging.com';
const stagingApiUrl = 'orangeqc-staging.com/api/v4';
const prodBaseUrl = 'orangeqc.com';
const prodApiUrl = 'orangeqc.com/api/v4';

interface Config {
  isDev: boolean;
  isStaging: boolean;
  APP_VERSION: string;
  DEVICE_ID: string;
  DEVICE_NAME: string;
  BACKEND_BASE_URL: string;
  BACKEND_API_URL: string;
}

const config: Config = {
  isDev: __DEV__,
  isStaging: true,
  APP_VERSION: `${Platform.OS} v${getVersion()} (${getBuildNumber()})`,
  DEVICE_ID: getDeviceId(),
  DEVICE_NAME: 'default name',
  BACKEND_BASE_URL: stagingBaseurl,
  BACKEND_API_URL: stagingApiUrl,
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

export const setEnv = (staging: boolean) => {
  if (!staging) {
    config.isStaging = false;
    config.BACKEND_BASE_URL = prodBaseUrl;
    config.BACKEND_API_URL = prodApiUrl;
  } else {
    config.isStaging = true;
    config.BACKEND_BASE_URL = stagingBaseurl;
    config.BACKEND_API_URL = stagingApiUrl;
  }
};

export default config;
