import { findIndex } from 'lodash/fp';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { UploadStore } from 'src/pullstate/uploadStore';
import { getUploadState } from 'src/pullstate/uploadStore/selectors';
import { PendingUpload } from 'src/types';

export const savePhotoUploadUrl = (upload: PendingUpload, fileName: string, url: string) => {
  PersistentUserStore.update((s) => {
    const index = findIndex({ draft: { guid: upload.draft.guid } }, s.pendingUploads);

    if (index !== -1) {
      s.pendingUploads[index].photoUploadUrls[fileName] = url;
    } else {
      console.warn('THIS SHOULDNT HAPPEN EVER');
      throw new Error('savePhotoUploadUrl error: pendingUpload doesnt exist in state');
    }
  });
};

export const setUploadingStateAction = (upload: PendingUpload, newUploadingState: PendingUpload['uploading']) => {
  UploadStore.update((s) => {
    const { guid } = upload.draft;
    const uploadState = getUploadState(s, guid);

    s[guid] = { ...uploadState, state: newUploadingState };
  });
};

export function setUploadProgress(upload: PendingUpload, progress: number) {
  UploadStore.update((s) => {
    const { guid } = upload.draft;
    const uploadState = getUploadState(s, guid);

    if (uploadState.progress !== progress) {
      uploadState.progress = progress;
    }
  });
}
