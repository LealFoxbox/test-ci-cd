import axios, { AxiosPromise } from 'axios';

import { PresignedPhoto } from 'src/types';

import { baseRaxConfig, getApiUrl } from './utils';

export interface PresignPhotosParams {
  photoUrls: string[];
  token: string;
  companyId: string;
}

export interface PresignPhotosResponse {
  presignedPosts: Record<string, PresignedPhoto>;
}

export const presignPhotos = (params: PresignPhotosParams) => {
  return axios({
    method: 'post',
    url: `${getApiUrl(params.companyId)}/uploads/presigned_posts`,
    withCredentials: false,
    data: {
      user_credentials: params.token,
      file_data: params.photoUrls.map((url) => ({
        name: url,
      })),
    },
    raxConfig: baseRaxConfig,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  }) as AxiosPromise<PresignPhotosResponse>;
};
