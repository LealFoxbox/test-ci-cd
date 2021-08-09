import { Platform } from 'react-native';
import {
  getBuildNumber,
  getBundleId,
  getModel,
  getSystemVersion,
  getUniqueId,
  getVersion,
} from 'react-native-device-info';
import { Locale, getLocales } from 'react-native-localize';
import { map, mapValues } from 'lodash/fp';

import { name as appName } from '../app.json';

const stagingBaseurl = 'orangeqc-staging.com';
const stagingApiUrl = 'orangeqc-staging.com/api/v4';
const prodBaseUrl = 'orangeqc.com';
const prodApiUrl = 'orangeqc.com/api/v4';

interface Config {
  isDev: boolean;
  APP_NAME: string;
  AMOUNT_INSPECTIONS_TO_RATE: number;
  APP_VERSION: string;
  APP_BUILD: string;
  DEVICE_ID: string;
  MODEL: string;
  PLATFORM_VERSION: string | number;
  BUNDLE_ID: string;
  PLATFORM: typeof Platform.OS;
  LOCALES: Locale[];
  SYSTEM_VERSION: string;
  PARSED_LOCALES: string;
  MOCKS: {
    DB: boolean;
    DATA_FORMS: boolean; // reproduces a huge data load on the app
    DOWNLOAD_STRUCTURES: boolean; // reproduces a huge data download time
    DOWNLOAD_ASSIGNMENTS: boolean; // reproduces a huge data download time
    DOWNLOAD_FORMS: boolean; // reproduces a huge data download time
    NOTES: boolean; // shows example notes when none are given by the BE
    FORM: boolean; // when creating a draft fill it with random valid data
    DELETE_BUTTONS: boolean; // on uploads and inspections home screens, show delete buttons
  };
  MOCK_LIMITS: {
    MAX_STRUCTURES: number;
    MAX_ASSIGNMENTS: number;
    MAX_FORMS: number;
    ITEMS_PER_PAGE: number;
  };
}

const config: Config = {
  isDev: __DEV__,
  AMOUNT_INSPECTIONS_TO_RATE: 4,
  APP_NAME: appName,
  APP_VERSION: getVersion(),
  APP_BUILD: getBuildNumber(),
  DEVICE_ID: getUniqueId(),
  MODEL: getModel(),
  PLATFORM_VERSION: Platform.Version,
  BUNDLE_ID: getBundleId(),
  LOCALES: getLocales(),
  SYSTEM_VERSION: getSystemVersion(),
  PARSED_LOCALES: map('languageTag', getLocales()).join(', '),
  PLATFORM: Platform.OS,
  MOCKS: {
    DB: false,
    DATA_FORMS: false,
    DOWNLOAD_STRUCTURES: false,
    DOWNLOAD_ASSIGNMENTS: false,
    DOWNLOAD_FORMS: false,
    NOTES: false,
    FORM: false,
    DELETE_BUTTONS: false,
  },
  MOCK_LIMITS: {
    MAX_STRUCTURES: 100000,
    MAX_ASSIGNMENTS: 100000,
    MAX_FORMS: 1000,
    ITEMS_PER_PAGE: 500,
  },
};

export const getApiUrl = (isStaging: boolean) => {
  if (!isStaging) {
    return prodApiUrl;
  }

  return stagingApiUrl;
};

export const getBaseUrl = (isStaging: boolean) => {
  if (!isStaging) {
    return prodBaseUrl;
  }

  return stagingBaseurl;
};

export const getMockFlags = (isStaging: boolean) => {
  if (!isStaging) {
    mapValues(() => false, config.MOCKS) as Config['MOCKS'];
  }

  return config.MOCKS;
};

export default config;
