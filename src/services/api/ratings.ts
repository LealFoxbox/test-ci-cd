import axios, { AxiosPromise } from 'axios';

import { Rating, SelectRatingChoice } from 'src/types';

import { baseRaxConfig, getApiUrl } from './utils';

export interface FetchRatingsResponse {
  ratings: Rating[];
}

export interface FetchRatingsParams {
  companyId: string;
  token: string;
}

export const fetchRatings = (params: FetchRatingsParams) => {
  return axios({
    method: 'get',
    url: `${getApiUrl(params.companyId)}/downloads/ratings`,
    withCredentials: false,
    params: {
      user_credentials: params.token,
    },
    raxConfig: baseRaxConfig,
    headers: {
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  }) as AxiosPromise<FetchRatingsResponse>;
};

export interface FetchRatingChoicesResponse {
  list_choices: SelectRatingChoice[];
  meta: {
    current_page: number;
    total_pages: number;
  };
}

export interface FetchRatingChoicesParams {
  companyId: string;
  token: string;
  ratingId: number;
  page: number;
}

export const fetchRatingChoices = (params: FetchRatingChoicesParams) => {
  return axios({
    method: 'get',
    url: `${getApiUrl(params.companyId)}/downloads/ratings/${params.ratingId}/list_choices`,
    withCredentials: false,
    params: {
      user_credentials: params.token,
      page: params.page,
    },
    raxConfig: baseRaxConfig,
    headers: {
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  }) as AxiosPromise<FetchRatingChoicesResponse>;
};
