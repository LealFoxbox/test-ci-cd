import { Store } from 'pullstate';

import { initialState } from './initialState';

export const DownloadStore = new Store(initialState);

export const errorAction = (error: string) => {
  DownloadStore.update((s) => {
    s.error = error;
  });
};

export const progressAction = (progress: number) => {
  DownloadStore.update((s) => {
    s.progress = progress;
  });
};
