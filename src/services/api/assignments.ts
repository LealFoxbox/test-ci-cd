import axios, { AxiosPromise } from 'axios';
import { uniqueId } from 'lodash/fp';

import config from 'src/config';
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

export const mockAssignmentsPage = (): Assignment[] => {
  const initId = parseInt(uniqueId(''), 10);
  return Array.from(Array(config.MOCK_LIMITS.MAX_ASSIGNMENTS / config.MOCK_LIMITS.ITEMS_PER_PAGE)).map(() => {
    const id = parseInt(uniqueId(''), 10);
    return {
      id,
      inspection_form_id: [83170, 83172, 83171, 83169][Math.floor(Math.random() * 4)],
      structure_id: 697212 + id - initId,
      updated_at: '2020-12-18T13:48:57-06:00',
    };
  });
};
