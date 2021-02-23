export type UploadState = null | 'photos' | 'form';

export type UploadStoreState = Record<string, { state: UploadState; progress: number; error: string | null }>; // key is guid

export const initialState: UploadStoreState = {};
