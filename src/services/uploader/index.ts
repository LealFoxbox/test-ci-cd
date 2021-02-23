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
import { UploadStoreState } from 'src/pullstate/uploadStore/initialState';

import { presignPhotos, submitInspection, uploadPhotos } from '../api/uploads';

import { savePhotoUploadUrl, setFormSubmittedAction, setUploadProgress, setUploadingStateAction } from './actions';

const FLAGS = {
  loggedIn: false,
};

// index starts from zero and represents the currently uploaded photo
function getPercentage(photoCount: number, index: number) {
  return (100 * (index + 1)) / (photoCount + 1);
}

function getCurrentUpload(pendingUploads: PendingUpload[], uploadStoreState: UploadStoreState) {
  return pendingUploads.find((p) => {
    const { guid } = p.draft;
    return !uploadStoreState[guid]?.error;
  });
}

function getPhotoUpload(upload: PendingUpload) {
  const allPhotos = flatMap('photos', upload.draft.fields) as DraftPhoto[];
  const index = allPhotos.findIndex((p) => !upload.photoUploadUrls[p.fileName]);

  return {
    index,
    length: allPhotos.length,
    photoUpload: index === -1 ? null : allPhotos[index],
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

  console.warn('photoUploader init of file ', photo.fileName);

  let file: string | undefined;

  try {
    file = await RNFS.readFile(photo.uri, 'base64');
  } catch (e) {
    console.warn('photoUploader: file read error for photoupload: ', e);
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

      try {
        await uploadPhotos({
          url: data.url,
          file,
          fileName: photo.fileName,
          fields: data.fields,
        });
      } catch (e) {
        uploadPhotoError = e as string;
      }

      if (!uploadPhotoError) {
        console.warn('photoUploader success with file ', photo.fileName);

        savePhotoUploadUrl(upload, photo.fileName, data['object-url']);
        setUploadProgress(upload, nextPercentage);
      } else {
        console.warn('photoUploader uploadPhotoError: ', uploadPhotoError);
      }
    } else {
      console.warn(
        'photoUploader presignPhotoError: ',
        presignPhotoError,
        ' and presign is ',
        presign ? ' correctly set' : ' undefined',
      );
    }
  }

  setUploadingStateAction(upload, null);
}

async function formUploader(token: string, companyId: string, pendingUpload: PendingUpload) {
  setUploadingStateAction(pendingUpload, 'form');

  console.warn('formUploader init: ', pendingUpload.draft.guid);

  const [submitError] = await axiosCatchTo(submitInspection({ pendingUpload, token, companyId }));

  if (!submitError) {
    console.warn('formUploader SUCCESS!');
    setFormSubmittedAction(pendingUpload);
  } else {
    console.warn('formUploader submitError: ', submitError);
  }
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
        const currentUpload = getCurrentUpload(pendingUploads, uploadStoreState);
        const state = currentUpload && getUploadState(uploadStoreState, currentUpload?.draft.guid).state;

        if (currentUpload && state === null) {
          const { index, length, photoUpload } = getPhotoUpload(currentUpload);

          if (photoUpload) {
            const nextPercentage = getPercentage(length, index);
            void photoUploader(token, subdomain, currentUpload, photoUpload, nextPercentage);
          } else {
            void formUploader(token, subdomain, currentUpload);
          }
        }
      }
    }
  }, [shouldTrigger, token, subdomain, inspectionsEnabled, connected, pendingUploads, uploadStoreState]);

  return setShouldTrigger;
}
