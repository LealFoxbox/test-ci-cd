import { Platform } from 'react-native';
import {
  getBuildNumber,
  getBundleId,
  getDeviceName,
  getModel,
  getUniqueId,
  getVersion,
} from 'react-native-device-info';
import { Locale, getLocales } from 'react-native-localize';
import { map } from 'lodash/fp';

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
  MODEL: string;
  PLATFORM_VERSION: string | number;
  BUNDLE_ID: string;
  LOCALES: Locale[];
  PARSED_LOCALES: string;
  BACKEND_BASE_URL: string;
  BACKEND_API_URL: string;
}

const config: Config = {
  isDev: __DEV__,
  isStaging: false,
  APP_VERSION: `${getVersion()} (${getBuildNumber()})`,
  DEVICE_ID: getUniqueId(),
  DEVICE_NAME: 'default name',
  MODEL: getModel(),
  PLATFORM_VERSION: Platform.Version,
  BUNDLE_ID: getBundleId(),
  LOCALES: getLocales(),
  PARSED_LOCALES: map('languageTag', getLocales()).join(', '),
  BACKEND_BASE_URL: '',
  BACKEND_API_URL: '',
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

// let's set the urls. Devs get set to staging by default.
setEnv(config.isDev);

export default config;
