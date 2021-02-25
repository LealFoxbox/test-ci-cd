import { Platform } from 'react-native';
import { getBuildNumber, getBundleId, getModel, getUniqueId, getVersion } from 'react-native-device-info';
import { Locale, getLocales } from 'react-native-localize';
import { map, mapValues } from 'lodash/fp';

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
  MOCKS: {
    DB: boolean;
    DATA_STRUCTURES: boolean; // reproduces a huge data load on the app
    DATA_ASSIGNMENTS: boolean; // reproduces a huge data load on the app
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
  MOCKS: {
    DB: false,
    DATA_STRUCTURES: false,
    DATA_ASSIGNMENTS: false,
    DATA_FORMS: false,
    DOWNLOAD_STRUCTURES: false,
    DOWNLOAD_ASSIGNMENTS: false,
    DOWNLOAD_FORMS: false,
    NOTES: false,
    FORM: true,
    DELETE_BUTTONS: true,
  },
  MOCK_LIMITS: {
    MAX_STRUCTURES: 100000,
    MAX_ASSIGNMENTS: 100000,
    MAX_FORMS: 1000,
    ITEMS_PER_PAGE: 500,
  },
};

// TODO: replace this with function getUrls(isStaging: boolean) => { base, api }
// and getMockFlags(isStaging: boolean) => MOCKS

export const setEnv = (isStaging: boolean) => {
  if (!isStaging) {
    config.isStaging = false;
    config.BACKEND_BASE_URL = prodBaseUrl;
    config.BACKEND_API_URL = prodApiUrl;
    config.MOCKS = mapValues(() => false, config.MOCKS) as Config['MOCKS'];
  } else {
    config.isStaging = true;
    config.BACKEND_BASE_URL = stagingBaseurl;
    config.BACKEND_API_URL = stagingApiUrl;
  }
};

// let's set the urls. Devs get set to staging by default.
setEnv(config.isDev);

export default config;
