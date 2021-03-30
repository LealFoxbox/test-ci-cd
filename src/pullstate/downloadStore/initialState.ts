export type DownloadState = {
  progress: number;
  error: string | null;
  downloading: 'forms' | 'db' | 'ratings' | 'ratingChoices' | 'fileDelete' | null;
};

export const initialState: DownloadState = {
  progress: 0,
  error: null,
  downloading: null,
};
