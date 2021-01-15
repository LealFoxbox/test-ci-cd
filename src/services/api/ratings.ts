import axios, { AxiosPromise } from 'axios';

import { Ratings } from 'src/types';

import { baseRaxConfig, getApiUrl } from './utils';

export interface FetchRatingsResponse {
  ratings: Ratings[];
  meta: {
    current_page: number;
    total_pages: number;
  };
}

export interface FetchRatingsParams {
  companyId: string;
  token: string;
  page: number;
}

export const fetchRatings = (params: FetchRatingsParams) => {
  return axios({
    method: 'get',
    url: `${getApiUrl(params.companyId)}/downloads/ratings`,
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
  }) as AxiosPromise<FetchRatingsResponse>;
};

export interface RatingChoices {
  id: number;
}

export interface FetchRatingChoicesResponse {
  list_choices: RatingChoices[];
  meta: {
    current_page: number;
    total_pages: number;
  };
}

export interface FetchRatingChoicesParams {
  companyId: string;
  token: string;
  ratingId: string;
}

export const fetchRatingChoices = (params: FetchRatingChoicesParams) => {
  return axios({
    method: 'get',
    url: `${getApiUrl(params.companyId)}/downloads/ratings/${params.ratingId}/list_choices`,
    withCredentials: false,
    params: {
      user_credentials: params.token,
    },
    raxConfig: baseRaxConfig,
    headers: {
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  }) as AxiosPromise<FetchRatingChoicesResponse>;
};
