import axios, { AxiosPromise } from 'axios';

import { Assignment } from 'src/types';

import { bigDownloadRaxConfig, getApiUrl } from './utils';

export interface FetchAssignmentsResponse {
  inspection_form_assignments: Assignment[];
  meta: {
    current_page: number;
    total_pages: number;
  };
}

export interface FetchAssignmentsParams {
  companyId: string;
  token: string;
  page: number;
}

export const fetchAssignments = (params: FetchAssignmentsParams) => {
  return axios({
    method: 'get',
    url: `${getApiUrl(params.companyId)}/downloads/inspection_form_assignments`,
    withCredentials: false,
    params: {
      user_credentials: params.token,
      page: params.page,
    },
    raxConfig: bigDownloadRaxConfig,
    headers: {
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  }) as AxiosPromise<FetchAssignmentsResponse>;
};
