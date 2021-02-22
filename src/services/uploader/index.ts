import { useEffect } from 'react';
import RNFS from 'react-native-fs';
import { flatMap } from 'lodash/fp';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { useTrigger } from 'src/utils/useTrigger';
import { axiosCatchTo } from 'src/utils/catchTo';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';
import { DraftPhoto, PendingUpload } from 'src/types';
import { getUploadState } from 'src/pullstate/uploadStore/selectors';
import { UploadStore } from 'src/pullstate/uploadStore';

import { presignPhotos, uploadPhotos } from '../api/uploads';

import { savePhotoUploadUrl, setUploadProgress, setUploadingStateAction } from './actions';

const FLAGS = {
  loggedIn: false,
};

// index starts from zero and represents the currently uploaded photo
function getPercentage(photoCount: number, index: number) {
  return (index + 1) / (photoCount + 1);
}

function getCurrentUpload(pendingUploads: PendingUpload[]) {
  return pendingUploads.find((u) => !u.error);
}

function getPhotoUpload(upload: PendingUpload) {
  const allPhotos = flatMap('photos', upload.draft.fields) as DraftPhoto[];
  const index = allPhotos.findIndex((p) => !upload.photoUploadUrls[p.fileName]);

  return {
    index,
    length: allPhotos.length,
    photoUpload: allPhotos[index],
  };
}

async function photoUploader(
  token: string,
  subdomain: string,
  upload: PendingUpload,
  photo: DraftPhoto,
  nextPercentage: number,
) {
  setUploadingStateAction(upload, 'photos');

  console.warn('UPLOADING ', photo.fileName);

  let file: string | undefined;

  try {
    file = await RNFS.readFile(photo.uri, 'base64');
  } catch (e) {
    console.warn('file read error for photoupload: ', e);
  }

  if (file) {
    const [presignPhotoError, presign] = await axiosCatchTo(
      presignPhotos({
        photoUrls: [photo.fileName],
        token,
        companyId: subdomain,
      }),
    );

    if (!presignPhotoError && presign) {
      const data = Object.values(presign.data.presignedPosts)[0];

      let uploadPhotoError: string | null = null;
      let success = null;

      try {
        success = await uploadPhotos({
          url: data.url,
          file,
          fileName: photo.fileName,
          fields: data.fields,
        });
      } catch (e) {
        uploadPhotoError = e as string;
      }

      if (!uploadPhotoError) {
        console.warn('upload response: ', JSON.stringify(success), ' of type ', typeof success);
        console.warn('UPLOADED ', photo.fileName, ' with url result: ', data['object-url']);

        savePhotoUploadUrl(upload, photo.fileName, data['object-url']);
        setUploadProgress(upload, nextPercentage);
      } else {
        console.warn('uploadPhotoError: ', uploadPhotoError);
      }
    } else {
      console.warn(
        'presignPhotoError: ',
        presignPhotoError,
        ' and presign is ',
        presign ? ' correctly set' : ' undefined',
      );
    }
  }

  setUploadingStateAction(upload, null);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formUploader(token: string, subdomain: string, upload: PendingUpload) {
  // setUploadingStateAction(upload, 'form');
  // logic goes here
  // setUploadingStateAction(upload, null);
}

export function useUploader() {
  const [shouldTrigger, setShouldTrigger] = useTrigger();
  const token = PersistentUserStore.useState((s) => s.userData?.single_access_token);
  const inspectionsEnabled = PersistentUserStore.useState((s) => s.userData?.features.inspection_feature.enabled);
  const subdomain = PersistentUserStore.useState((s) => s.userData?.account.subdomain);
  const pendingUploads = PersistentUserStore.useState((s) => s.pendingUploads);
  const uploadStoreState = UploadStore.useState((s) => s);
  const connected = useNetworkStatus();

  useEffect(() => {
    if (!token) {
      FLAGS.loggedIn = false;
    } else if (shouldTrigger && subdomain) {
      FLAGS.loggedIn = true;
      if (inspectionsEnabled && connected) {
        const currentUpload = getCurrentUpload(pendingUploads);
        const state = currentUpload && getUploadState(uploadStoreState, currentUpload?.draft.guid).state;

        if (currentUpload && state === null) {
          const { index, length, photoUpload } = getPhotoUpload(currentUpload);
          const nextPercentage = getPercentage(length, index);

          if (index !== -1) {
            void photoUploader(token, subdomain, currentUpload, photoUpload, nextPercentage);
          } else {
            formUploader(token, subdomain, currentUpload);
          }
        }
      }
    }
  }, [shouldTrigger, token, subdomain, inspectionsEnabled, connected, pendingUploads, uploadStoreState]);

  return setShouldTrigger;
}
