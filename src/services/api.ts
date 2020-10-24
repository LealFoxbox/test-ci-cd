import axios, { AxiosPromise } from 'axios';

import config from 'src/config';
import { User } from 'src/types';

export interface UserResponse {
  user: User;
}

export interface AuthParams {
  username: string;
  password: string;
  companyId: string;
}

export function getApiUrl(companyId: string) {
  return `https://${companyId}.${config.BACKEND_API_URL}`;
}

export const authenticate = (params: AuthParams) => {
  return axios({
    method: 'post',
    url: `${getApiUrl(params.companyId)}/authenticate`,
    data: {
      user_session: {
        login: params.username,
        password: params.password,
      },
      device_guid: config.DEVICE_ID,
      app_version: config.APP_VERSION,
      device_name: config.DEVICE_NAME,
    },
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
  return axios.get(`${getApiUrl(params.companyId)}/authenticate`, {
    params: {
      user_credentials: params.token,
      device_guid: config.DEVICE_ID,
      app_version: config.APP_VERSION,
    },
    headers: {
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  }) as AxiosPromise<UserResponse>;
};
