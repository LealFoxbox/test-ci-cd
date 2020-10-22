import axios, { AxiosPromise } from 'axios';

import config from 'src/config';
import { User } from 'src/types';

export interface AuthReturn {
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

export function getBaseUrl(companyId: string) {
  return `https://${companyId}.${config.BACKEND_BASE_URL}`;
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
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }) as AxiosPromise<AuthReturn>;
};
