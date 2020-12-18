import axios, { AxiosPromise } from 'axios';

import { Form } from 'src/types';

import { baseRaxConfig, getApiUrl } from './utils';

export interface FetchFormResponse {
  inspection_form: Form;
}

export interface FetchFormParams {
  companyId: string;
  token: string;
  formId: string;
}

export const fetchForm = (params: FetchFormParams) => {
  return axios({
    method: 'get',
    url: `${getApiUrl(params.companyId)}/downloads/inspection_forms/${params.formId}`,
    withCredentials: false,
    params: {
      user_credentials: params.token,
    },
    raxConfig: baseRaxConfig,
    headers: {
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  }) as AxiosPromise<FetchFormResponse>;
};
