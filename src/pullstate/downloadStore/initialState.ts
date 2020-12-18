export type DownloadState = {
  progress: number;
  error: string | null;
};

export const initialState: DownloadState = {
  progress: 0,
  error: null,
};
