import axios, { AxiosPromise } from 'axios';
import { uniqueId } from 'lodash/fp';

import config from 'src/config';
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
    url: `${getApiUrl(params.companyId)}/downloads/structures`,
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
  }) as AxiosPromise<FetchStructuresResponse>;
};

export const mockStructuresPage = (): Structure[] => {
  return Array.from(Array(config.MOCK_LIMITS.MAX_STRUCTURES / config.MOCK_LIMITS.ITEMS_PER_PAGE)).map(() => {
    const id = uniqueId('');
    return {
      id: parseInt(id, 10),
      active_children_count: 0,
      ancestry: '697200',
      display_name: 'Mock ' + id,
      location_path: null,
      notes: null,
      parent_id: 697200,
      updated_at: '2020-12-18T13:46:11-06:00',
    };
  });
};
