import axios, { AxiosPromise } from 'axios';
import RNFetchBlob from 'rn-fetch-blob';

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

export interface UploadPhotoParams {
  url: string;
  file: string;
  fileName: string;
  fields: {
    acl: string;
    key: string;
    policy: string;
    'x-amz-credential': string;
    'x-amz-algorithm': string;
    'x-amz-date': string;
    'x-amz-signature': string;
  };
}

type Body = { name: string; data: string; filename?: string };

export const uploadPhotos = (params: UploadPhotoParams) => {
  const data: Body[] = Object.entries(params.fields).map(([key, value]) => {
    return { name: key, data: value };
  });

  data.push({ name: 'file', filename: params.fileName, data: params.file });

  return RNFetchBlob.fetch(
    'POST',
    params.url,
    {
      'Content-Type': 'multipart/form-data',
    },
    data,
  );
};
