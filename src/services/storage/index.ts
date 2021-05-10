import { PermissionsAndroid } from 'react-native';
import ReactNativeBlobUtil, { FetchBlobResponse, ReactNativeBlobUtilConfig } from 'react-native-blob-util';

interface FetchDownload {
  options: ReactNativeBlobUtilConfig;
  url: string;
  headers: { [key: string]: string };
}

interface FetchUpload {
  url: string;
  data: { name: string; data: string; filename?: string }[];
}

export const downloadDir = ReactNativeBlobUtil.fs.dirs.DownloadDir;

export async function requestStoragePermission(): Promise<boolean> {
  try {
    const read = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    const write = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    return read === PermissionsAndroid.RESULTS.GRANTED && write === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.warn(error.message);
    return false;
  }
}

export async function downloaderStorage({ options, url, headers }: FetchDownload): Promise<FetchBlobResponse> {
  return ReactNativeBlobUtil.config(options).fetch('GET', url, headers);
}

export async function uploaderStorage({ url, data }: FetchUpload) {
  try {
    return await ReactNativeBlobUtil.fetch(
      'POST',
      url,
      {
        'Content-Type': 'multipart/form-data',
      },
      data,
    );
  } catch (error) {
    console.warn('[APP][DOWNLOADER] ERROR => UPLOADER_STORAGE');
    throw new Error('[APP] [ERROR] uploader storage');
  }
}
