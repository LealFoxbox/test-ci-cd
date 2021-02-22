export type UploadState = null | 'photos' | 'form';

export type UploadStoreState = Record<string, { state: UploadState; progress: number; error: string | null }>;

export const initialState: UploadStoreState = {};
