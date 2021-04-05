import { PermissionsAndroid } from 'react-native';
import RNFetchBlob, { FetchBlobResponse, RNFetchBlobConfig } from 'rn-fetch-blob';

interface FetchDownload {
  options: RNFetchBlobConfig;
  url: string;
  headers: { [key: string]: string };
}

interface FetchUpload {
  url: string;
  data: { name: string; data: string; filename?: string }[];
}

export const downloadDir = RNFetchBlob.fs.dirs.DownloadDir;

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
  return RNFetchBlob.config(options).fetch('GET', url, headers);
}

export async function uploaderStorage({ url, data }: FetchUpload) {
  return RNFetchBlob.fetch(
    'POST',
    url,
    {
      'Content-Type': 'multipart/form-data',
    },
    data,
  );
}
