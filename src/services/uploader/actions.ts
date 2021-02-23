import { findIndex, omit, set } from 'lodash/fp';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { UploadStore } from 'src/pullstate/uploadStore';
import { UploadState } from 'src/pullstate/uploadStore/initialState';
import { getUploadState } from 'src/pullstate/uploadStore/selectors';
import { PendingUpload } from 'src/types';

export const savePhotoUploadUrl = (upload: PendingUpload, fileName: string, url: string) => {
  PersistentUserStore.update((s) => {
    const { guid } = upload.draft;
    const index = findIndex({ draft: { guid } }, s.pendingUploads);

    if (index !== -1) {
      return {
        ...s,
        pendingUploads: set([index, 'photoUploadUrls', fileName], url, s.pendingUploads),
      };
    } else {
      console.warn('savePhotoUploadUrl error: pendingUpload doesnt exist in state');
      throw new Error('savePhotoUploadUrl error: pendingUpload doesnt exist in state');
    }
  });
};

export const setUploadingStateAction = (upload: PendingUpload, newUploadingState: UploadState) => {
  UploadStore.update((s) => {
    const { guid } = upload.draft;

    return {
      ...s,
      [guid]: {
        ...getUploadState(s, guid),
        state: newUploadingState,
      },
    };
  });
};

export function setUploadProgress(upload: PendingUpload, progress: number) {
  UploadStore.update((s) => {
    const { guid } = upload.draft;

    return {
      ...s,
      [guid]: {
        ...getUploadState(s, guid),
        progress,
      },
    };
  });
}

export function setFormSubmittedAction(upload: PendingUpload) {
  PersistentUserStore.update((s) => {
    const { guid } = upload.draft;

    return {
      ...s,
      pendingUploads: s.pendingUploads.filter((p) => p.draft.guid !== guid),
      uploads: s.uploads.concat([{ ...upload, submittedAt: Date.now() }]),
    };
  });

  UploadStore.update((s) => {
    const { guid } = upload.draft;

    return omit([guid], s);
  });
}
