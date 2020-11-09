import { Platform } from 'react-native';
import { getBuildNumber, getBundleId, getModel, getUniqueId, getVersion } from 'react-native-device-info';
import { Locale, getLocales } from 'react-native-localize';
import { map } from 'lodash/fp';

import { name as appName } from '../app.json';

const stagingBaseurl = 'orangeqc-staging.com';
const stagingApiUrl = 'orangeqc-staging.com/api/v4';
const prodBaseUrl = 'orangeqc.com';
const prodApiUrl = 'orangeqc.com/api/v4';

interface Config {
  isDev: boolean;
  isStaging: boolean;
  APP_NAME: string;
  APP_VERSION: string;
  APP_BUILD: string;
  DEVICE_ID: string;
  MODEL: string;
  PLATFORM_VERSION: string | number;
  BUNDLE_ID: string;
  PLATFORM: typeof Platform.OS;
  LOCALES: Locale[];
  PARSED_LOCALES: string;
  BACKEND_BASE_URL: string;
  BACKEND_API_URL: string;
}

const config: Config = {
  isDev: __DEV__,
  isStaging: false,
  APP_NAME: appName,
  APP_VERSION: getVersion(),
  APP_BUILD: getBuildNumber(),
  DEVICE_ID: getUniqueId(),
  MODEL: getModel(),
  PLATFORM_VERSION: Platform.Version,
  BUNDLE_ID: getBundleId(),
  LOCALES: getLocales(),
  PARSED_LOCALES: map('languageTag', getLocales()).join(', '),
  BACKEND_BASE_URL: '',
  BACKEND_API_URL: '',
  PLATFORM: Platform.OS,
};

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
