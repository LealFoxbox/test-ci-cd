import RNFS from 'react-native-fs';
import { find, findIndex, mapValues, omit, set } from 'lodash/fp';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { UploadStore } from 'src/pullstate/uploadStore';
import { UploadStoreState } from 'src/pullstate/uploadStore/initialState';
import { getUploadState } from 'src/pullstate/uploadStore/selectors';
import { DraftPhoto, PendingUpload } from 'src/types';

export const savePhotoUploadUrlAction = (upload: PendingUpload, fileName: string, url: string) => {
  PersistentUserStore.update((s) => {
    const { guid } = upload.draft;
    const index = findIndex({ draft: { guid } }, s.pendingUploads);

    if (index !== -1) {
      return {
        ...s,
        pendingUploads: set([index, 'photoUploadUrls', fileName], url, s.pendingUploads),
      };
    } else {
      console.warn('savePhotoUploadUrlAction error: pendingUpload doesnt exist in state');
      throw new Error('savePhotoUploadUrlAction error: pendingUpload doesnt exist in state');
    }
  });
};

export const setUploadingFieldAction = <T>(upload: PendingUpload, fieldName: keyof UploadStoreState, value: T) => {
  UploadStore.update((s) => {
    const { guid } = upload.draft;

    return {
      ...s,
      [guid]: {
        ...getUploadState(s, guid),
        [fieldName]: value,
      },
    };
  });
};

export function setUploadingErrorAction(upload: PendingUpload, error: string) {
  UploadStore.update((s) => {
    const { guid } = upload.draft;

    return {
      ...s,
      [guid]: {
        ...getUploadState(s, guid),
        error,
        state: null,
      },
    };
  });
}

export function finishPhotoUploadAction(upload: PendingUpload, progress: number) {
  UploadStore.update((s) => {
    const { guid } = upload.draft;

    return {
      ...s,
      [guid]: {
        ...getUploadState(s, guid),
        progress: progress,
        state: null,
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

export async function removeUploadingPhotoAction(upload: PendingUpload, photo: DraftPhoto) {
  try {
    await RNFS.unlink(photo.uri);
  } catch (e) {
    console.warn('removeUploadingPhotoAction RNFS.unlink error: ', e);
  }

  PersistentUserStore.update((s) => {
    const { guid } = upload.draft;
    const index = findIndex({ draft: { guid } }, s.pendingUploads);

    if (index === -1) {
      console.warn('removeUploadingPhotoAction error: upload argument doesnt exist in pendingUploads');
      // s.pendingUploads = s.pendingUploads.filter((item) => item.draft.guid !== undefined);
      throw new Error('removeUploadingPhotoAction error: upload argument doesnt exist in pendingUploads');
    }

    const fields = s.pendingUploads[index].draft.fields;

    const fieldKey = find((key) => {
      return findIndex({ uri: photo.uri }, fields[key].photos) !== -1;
    }, Object.keys(fields));

    if (fieldKey === undefined) {
      console.warn('removeUploadingPhotoAction error: photo doesnt exist in pendingUploads');
      throw new Error('removeUploadingPhotoAction error: photo doesnt exist in pendingUploads');
    }

    const newPhotos = fields[fieldKey].photos.filter((p) => p.uri !== photo.uri);
    return set(['pendingUploads', index, 'draft', 'fields', fieldKey, 'photos'], newPhotos, s);
  });
}

export function cleanUploadErrorsAction() {
  UploadStore.update((s) => {
    return mapValues((u) => ({ ...u, error: null }), s);
  });
}
