import axios, { AxiosPromise } from 'axios';

import { Structure } from 'src/types';

import { bigDownloadRaxConfig, getApiUrl } from './utils';

export interface FetchStructuresResponse {
  structures: Structure[];
  meta: {
    current_page: number;
    total_pages: number;
  };
}

export interface FetchStructuresParams {
  companyId: string;
  token: string;
  page: number;
}

export const fetchStructures = (params: FetchStructuresParams) => {
  return axios({
    method: 'get',
    url: `${getApiUrl(params.companyId)}/downloads/structures?user_credentials=${params.token}&page=${params.page}`,
    // url: `${getApiUrl(params.companyId)}/downloads/structures`,
    withCredentials: false,
    /*params: {
      user_credentials: params.token,
      page: params.page,
    },*/
    raxConfig: bigDownloadRaxConfig,
    headers: {
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  }) as AxiosPromise<FetchStructuresResponse>;
};
