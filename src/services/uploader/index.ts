import { useEffect } from 'react';
import { findIndex } from 'lodash/fp';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { useTrigger } from 'src/utils/useTrigger';
import { axiosCatchTo } from 'src/utils/catchTo';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';
import { DraftPhoto, PendingUpload } from 'src/types';

import { presignPhotos } from '../api/uploads';

const FLAGS = {
  loggedIn: false,
};

function getCurrentUpload(pendingUploads: PendingUpload[]) {
  return pendingUploads.find((u) => !u.error);
}

function getPhotoUpload(upload: PendingUpload) {
  return Object.values(upload.draft.fields).find((f) => f.photos.length > 0)?.photos[0];
}

function setUploading(upload: PendingUpload, newUploadingState: PendingUpload['uploading']) {
  PersistentUserStore.update((s) => {
    const index = findIndex({ draft: { guid: upload.draft.guid } }, s.pendingUploads);

    if (index !== -1) {
      s.pendingUploads[index].uploading = newUploadingState;
    } else {
      throw new Error('WHAT');
    }
  });
}

let signed = false;

async function photoUploader(token: string, subdomain: string, upload: PendingUpload, photo: DraftPhoto) {
  if (!signed) {
    setUploading(upload, 'photos');

    signed = true;
    const [error, result] = await axiosCatchTo(
      presignPhotos({
        photoUrls: [photo.fileName],
        token,
        companyId: subdomain,
      }),
    );

    console.warn('presignPhotos result: ', JSON.stringify(result));
    console.warn('presignPhotos error: ', JSON.stringify(error));

    // logic goes here

    setUploading(upload, null);
  }
}

function formUploader(token: string, subdomain: string, upload: PendingUpload) {
  if (!signed) {
    setUploading(upload, 'form');

    // logic goes here

    setUploading(upload, null);
  }
}

export function useUploader() {
  const [shouldTrigger, setShouldTrigger] = useTrigger();
  const token = PersistentUserStore.useState((s) => s.userData?.single_access_token);
  const inspectionsEnabled = PersistentUserStore.useState((s) => s.userData?.features.inspection_feature.enabled);
  const subdomain = PersistentUserStore.useState((s) => s.userData?.account.subdomain);
  const pendingUploads = PersistentUserStore.useState((s) => s.pendingUploads);
  const connected = useNetworkStatus();

  useEffect(() => {
    if (!token) {
      FLAGS.loggedIn = false;
    } else if (shouldTrigger && subdomain) {
      FLAGS.loggedIn = true;
      if (inspectionsEnabled && connected) {
        const currentUpload = getCurrentUpload(pendingUploads);
        if (currentUpload && currentUpload.uploading === null) {
          const photoUpload = getPhotoUpload(currentUpload);

          if (photoUpload) {
            void photoUploader(token, subdomain, currentUpload, photoUpload);
          } else {
            formUploader(token, subdomain, currentUpload);
          }
        }
      }
    }
  }, [shouldTrigger, token, subdomain, inspectionsEnabled, connected, pendingUploads]);

  return setShouldTrigger;
}
