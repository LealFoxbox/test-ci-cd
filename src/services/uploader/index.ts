/* eslint-disable no-console */
import { useEffect } from 'react';
import RNFS from 'react-native-fs';
import { flatMap } from 'lodash/fp';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { LoginStore } from 'src/pullstate/loginStore';
import { useTrigger } from 'src/utils/useTrigger';
import { axiosCatchTo } from 'src/utils/catchTo';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';
import { DraftPhoto, PendingUpload } from 'src/types';
import { getUploadState } from 'src/pullstate/uploadStore/selectors';
import { UploadStore } from 'src/pullstate/uploadStore';
import { UploadStoreState } from 'src/pullstate/uploadStore/initialState';
import usePrevious from 'src/utils/usePrevious';

import { presignPhotos, submitInspection, uploadPhotos } from '../api/uploads';
import {
  cleanUploadErrorsAction,
  finishPhotoUploadAction,
  removeUploadingPhotoAction,
  savePhotoUploadUrlAction,
  setFormSubmittedAction,
  setUploadingErrorAction,
  setUploadingFieldAction,
} from '../../pullstate/uploaderActions';

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
  setUploadingFieldAction(upload, 'state', 'photos');

  console.log('photoUploader init of file ', photo.fileName);

  let file: string | undefined;

  try {
    file = await RNFS.readFile(photo.uri, 'base64');
  } catch (e) {
    console.warn('photoUploader: file read error for photoupload: ', e);
    removeUploadingPhotoAction(upload, photo);
  }

  if (file) {
    const [presignPhotoError, presign] = await axiosCatchTo(() =>
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
        console.log('photoUploader success with file ', photo.fileName);

        savePhotoUploadUrlAction(upload, photo.fileName, data['object-url']);
        finishPhotoUploadAction(upload, nextPercentage);
      } else {
        console.warn('photoUploader uploadPhotoError: ', uploadPhotoError);
        setUploadingErrorAction(upload, `Could not upload ${photo.fileName}`);
      }
    } else {
      console.warn(
        'photoUploader presignPhotoError: ',
        presignPhotoError,
        ' and presign is ',
        presign ? ' correctly set' : ' undefined',
      );
      setUploadingErrorAction(upload, `Could not presign ${photo.fileName}`);
    }
  } else {
    setUploadingFieldAction(upload, 'state', null);
  }
}

async function formUploader(token: string, companyId: string, pendingUpload: PendingUpload) {
  setUploadingFieldAction(pendingUpload, 'state', 'form');

  console.log('formUploader init: ', pendingUpload.draft.guid);

  const [submitError] = await axiosCatchTo(() => submitInspection({ pendingUpload, token, companyId }));

  if (!submitError) {
    console.log('formUploader SUCCESS!');
    setFormSubmittedAction(pendingUpload);
  } else {
    console.warn(`Could not submit draft guid ${pendingUpload.draft.guid} with submitError: `, submitError);

    setUploadingErrorAction(pendingUpload, `Could not submit`);
  }
}

export function useUploader(): ReturnType<typeof useTrigger> {
  const [shouldTrigger, setShouldTrigger, resetTrigger] = useTrigger();
  const { token, inspectionsEnabled, subdomain } = LoginStore.useState((s) => ({
    token: s.userData?.single_access_token,
    inspectionsEnabled: s.userData?.features.inspection_feature.enabled,
    subdomain: s.userData?.account.subdomain,
  }));
  const pendingUploads = PersistentUserStore.useState((s) => s.pendingUploads);
  const uploadStoreState = UploadStore.useState((s) => s);
  const connected = useNetworkStatus();
  const prevConnected = usePrevious(connected);

  useEffect(() => {
    if (!prevConnected && connected) {
      cleanUploadErrorsAction();
    }
  }, [connected, prevConnected]);

  useEffect(() => {
    if (!token) {
      if (FLAGS.loggedIn) {
        FLAGS.loggedIn = false;
        resetTrigger();
      }
    } else if (shouldTrigger && subdomain) {
      FLAGS.loggedIn = true;
      if (inspectionsEnabled && connected) {
        const currentUpload = getCurrentUpload(pendingUploads, uploadStoreState);
        const uploadState = currentUpload && getUploadState(uploadStoreState, currentUpload?.draft.guid).state;

        if (currentUpload && uploadState === null) {
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
  }, [shouldTrigger, token, subdomain, inspectionsEnabled, connected, pendingUploads, uploadStoreState, resetTrigger]);

  return [shouldTrigger, setShouldTrigger, resetTrigger];
}
