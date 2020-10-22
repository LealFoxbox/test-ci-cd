import Config from 'react-native-config';

type Env = 'dev' | 'production';

const { SENTRY_DSN, BACKEND_BASE_URL, BACKEND_API_URL, RELEASE_VERSION, APP_ENV, BUILD_ID } = Config;

interface Config {
  isDev: boolean;
  ENV: Env;
  RELEASE_VERSION: string;
  BUILD_ID: string;
  SENTRY_DSN: string;
  BACKEND_BASE_URL: string;
  BACKEND_API_URL: string;
}

const config: Config = {
  isDev: __DEV__,
  ENV: __DEV__ ? 'dev' : (APP_ENV as Env) || 'dev',
  RELEASE_VERSION,
  BUILD_ID,
  SENTRY_DSN,
  BACKEND_BASE_URL,
  BACKEND_API_URL,
};

export default config;
