import axios, { AxiosPromise } from 'axios';
import { formatISO } from 'date-fns';

import { PendingUpload, PresignedPhoto } from 'src/types';
import Storage from 'src/services/storage';

import { bigDownloadRaxConfig, getApiUrl } from './utils';

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
    raxConfig: bigDownloadRaxConfig,
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

  return Storage.upload({
    url: params.url,
    data,
  });
};

export interface SubmitInspectionParams {
  pendingUpload: PendingUpload;
  token: string;
  companyId: string;
}

export interface SubmitInspectionResponse {
  inspection: {
    id: number;
    inspection_event: {
      id: number;
      account_id: number;
      name: null | string;
      due_at: string;
      original_due_at: string;
      inspection_form_id: number;
      structure_id: number;
      inspection_id: number;
      updated_at: string;
      deleted_at: null | string;
      display_name: string;
      assignee: null | string;
    };
  };
}

export const submitInspection = (params: SubmitInspectionParams) => {
  const {
    pendingUpload: { draft, photoUploadUrls },
  } = params;

  return axios({
    method: 'post',
    url: `${getApiUrl(params.companyId)}/uploads/inspections`,
    withCredentials: false,
    data: {
      user_credentials: params.token,
      submission_token: draft.guid,
      inspection_event_id: draft.eventId !== undefined ? parseInt(draft.eventId, 10) : undefined,
      inspection: {
        name: draft.name,
        structure_id: draft.structureId,
        inspection_form_id: draft.formId,
        started_at: formatISO(draft.started_at || draft.lastModified || draft.ended_at),
        ended_at: formatISO(draft.ended_at),
        flagged: draft.flagged,
        private: draft.private,
        latitude: draft.latitude,
        longitude: draft.longitude,
        inspection_items: Object.values(draft.fields)
          .filter((f) => !f.deleted)
          .map((f) => {
            const common = {
              rating_id: f.rating_id,
              line_item_id: f.formFieldId,
              weight: f.weight,
              position: f.position,
              description: f.description,
              category_id: f.category_id,
              comment: f.comment,
              inspection_item_photos: f.photos.map((photo) => ({
                source_type: photo.isFromGallery ? '2' : '1',
                temporary_url: photoUploadUrls[photo.fileName],
                latitude: photo.latitude,
                longitude: photo.longitude,
                created_at: formatISO(photo.created_at),
              })),
              list_choice_ids: null,
              number_choice: null,
            };

            if (f.ratingTypeId === 1) {
              return {
                ...common,
                deficient: f.selectedChoice?.deficient || false,
                range_choice_position: f.selectedChoice?.position || 0,
                range_choice_min_position: f.minPosition,
                range_choice_max_position: f.maxPosition,
                range_choice_label: f.selectedChoice?.label || '',
                score: f.selectedChoice?.score,
              };
            }

            if (f.ratingTypeId === 6) {
              return {
                ...common,

                number_choice: f.number_choice,
              };
            }

            if (f.ratingTypeId === 7) {
              return {
                ...common,

                range_choice_label: f.selectedChoice?.label,
                deficient: f.selectedChoice?.deficient,
                range_choice_position: f.selectedChoice?.position,
                points: f.selectedChoice?.points,
              };
            }

            if (f.ratingTypeId === 8 || f.ratingTypeId === 9) {
              return {
                ...common,

                list_choice_ids: f.list_choice_ids,
              };
            }

            return common;
          }),
      },
    },
    raxConfig: bigDownloadRaxConfig,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  }) as AxiosPromise<SubmitInspectionResponse>;
};
