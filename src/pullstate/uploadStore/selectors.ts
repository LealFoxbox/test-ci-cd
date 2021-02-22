import { UploadStoreState } from './initialState';

export function getUploadState(s: UploadStoreState, guid?: string) {
  if (guid && s[guid]) {
    return s[guid];
  }

  return { state: null, progress: 0, error: null };
}
