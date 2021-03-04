import { name as appName } from '../../app.json';

const config = {
  isDev: true,
  isStaging: false,
  APP_NAME: appName,
  APP_VERSION: '0',
  APP_BUILD: '0',
  DEVICE_ID: '0',
  MODEL: '0',
  PLATFORM_VERSION: '0',
  BUNDLE_ID: '0',
  LOCALES: [
    {
      languageCode: 'en',
      scriptCode: 'en',
      countryCode: 'en',
      languageTag: 'en',
      isRTL: false,
    },
  ],
  PARSED_LOCALES: 'en',
  PLATFORM: 'android',
  MOCKS: {
    DB: true,
    DATA_STRUCTURES: false,
    DATA_ASSIGNMENTS: false,
    DATA_FORMS: false,
    DOWNLOAD_STRUCTURES: false,
    DOWNLOAD_ASSIGNMENTS: false,
    DOWNLOAD_FORMS: false,
    NOTES: false,
  },
  MOCK_LIMITS: {
    MAX_STRUCTURES: 10,
    MAX_ASSIGNMENTS: 10,
    MAX_FORMS: 10,
    ITEMS_PER_PAGE: 5,
  },
};

export const getApiUrl = (_isStaging: boolean) => {
  return 'http://google.com';
};

export const getBaseUrl = (_isStaging: boolean) => {
  return 'http://google.com';
};

export const getMockFlags = (_isStaging: boolean) => {
  return config.MOCKS;
};

export default config;
