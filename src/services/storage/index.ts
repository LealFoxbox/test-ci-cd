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

class Storage {
  static downloadDir = RNFetchBlob.fs.dirs.DownloadDir;

  static requestPermission = async (): Promise<boolean> => {
    try {
      const read = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      const write = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      return read === PermissionsAndroid.RESULTS.GRANTED && write === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.warn(error.message);
      return false;
    }
  };

  static download = async ({ options, url, headers }: FetchDownload): Promise<FetchBlobResponse> => {
    return RNFetchBlob.config(options).fetch('GET', url, headers);
  };

  static upload = async ({ url, data }: FetchUpload) => {
    return RNFetchBlob.fetch(
      'POST',
      url,
      {
        'Content-Type': 'multipart/form-data',
      },
      data,
    );
  };
}

export default Storage;
