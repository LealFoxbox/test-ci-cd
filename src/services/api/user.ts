import axios, { AxiosPromise } from 'axios';
import * as rax from 'retry-axios';

import config from 'src/config';
import { User } from 'src/types';

import { baseRaxConfig, getApiUrl } from './utils';

rax.attach();

export interface AuthParams {
  username: string;
  password: string;
  companyId: string;
}

export interface UserResponse {
  user: User;
}

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
    timeout: 500,
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
