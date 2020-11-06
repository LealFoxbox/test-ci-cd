import axios, { AxiosError, AxiosPromise } from 'axios';
import * as rax from 'retry-axios';
import { getOr } from 'lodash/fp';

import config from 'src/config';
import { User } from 'src/types';

rax.attach();

export interface UserResponse {
  user: User;
}

export interface AuthParams {
  username: string;
  password: string;
  companyId: string;
}

export type ApiError = AxiosError<{ message: string; error: string }>;

export function getApiUrl(companyId: string) {
  return `https://${companyId}.${config.BACKEND_API_URL}`;
}

const baseRaxConfig: rax.RaxConfig['raxConfig'] = {
  retryDelay: 200,
  backoffType: 'exponential',
  shouldRetry: (err) => {
    const cfg = rax.getConfig(err);
    const currentRetryAttempt = getOr(0, 'currentRetryAttempt', cfg);
    const retry = getOr(4, 'retry', cfg);

    if (currentRetryAttempt <= retry) {
      console.warn('Endpoint Error. Axios retry?', err.response?.status === 503);
      return err.response?.status === 503;
    }
    return false;
  },
};

// NOTE: we disable cookies with "withCredentials: false" because they're being set on the return header
// and if we don't specify to NOT use cookies, we'll always log in as the last user logged in

export const authenticate = (params: AuthParams) => {
  return axios({
    method: 'post',
    url: `${getApiUrl(params.companyId)}/authenticate`,
    withCredentials: false,
    data: {
      user_session: {
        login: params.username,
        password: params.password,
      },
      device_guid: config.DEVICE_ID,
      app_version: `${config.PLATFORM}-${config.APP_VERSION}`,
      device_name: config.MODEL,
    },
    raxConfig: baseRaxConfig,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }) as AxiosPromise<UserResponse>;
};

export interface FetchUserParams {
  companyId: string;
  token: string;
}

export const fetchtUser = (params: FetchUserParams) => {
  return axios({
    method: 'get',
    url: `${getApiUrl(params.companyId)}/authenticate`,
    withCredentials: false,
    params: {
      user_credentials: params.token,
      device_guid: config.DEVICE_ID,
      app_version: `${config.PLATFORM}-${config.APP_VERSION}`,
    },
    raxConfig: baseRaxConfig,
    headers: {
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  }) as AxiosPromise<UserResponse>;
};
