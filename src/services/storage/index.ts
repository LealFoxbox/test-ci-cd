import { PermissionsAndroid } from 'react-native';
import ReactNativeBlobUtil, { FetchBlobResponse, ReactNativeBlobUtilConfig } from 'react-native-blob-util';
import * as Sentry from '@sentry/react-native';

import config from 'src/config';
import { logErrorToSentry } from 'src/utils/logger';

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

export async function askStoragePermission(): Promise<boolean> {
  try {
    let storagePermission = true;
    if (parseInt(config.SYSTEM_VERSION, 10) < 10) {
      const read = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      const write = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
        title: 'Storage Access Permission',
        message: 'We would like to access your photos for uploading',
        buttonPositive: 'Okay',
      });
      storagePermission = read === PermissionsAndroid.RESULTS.GRANTED && write === PermissionsAndroid.RESULTS.GRANTED;
    }
    return storagePermission;
  } catch (error) {
    logErrorToSentry('[INFO][askStoragePermission]', {
      severity: Sentry.Severity.Info,
      infoMessage: error?.message,
    });
    return false;
  }
}

export async function askWriteStoragePermission(): Promise<boolean> {
  try {
    let storagePermission = true;
    if (parseInt(config.SYSTEM_VERSION, 10) < 10) {
      const checkPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
        title: 'Storage Access Permission',
        message: 'We would like to access your photos for uploading',
        buttonPositive: 'Okay',
      });
      storagePermission = checkPermission === PermissionsAndroid.RESULTS.GRANTED;
    }
    return storagePermission;
  } catch (error) {
    logErrorToSentry('[INFO][askWriteStoragePermission]', {
      severity: Sentry.Severity.Info,
      infoMessage: error?.message,
    });
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
    logErrorToSentry('[INFO][uploaderStorage]', {
      severity: Sentry.Severity.Info,
      infoMessage: error?.message,
    });
    throw new Error('[APP] [ERROR] uploader storage');
  }
}

export async function removeAllStorage(): Promise<void> {
  try {
    await ReactNativeBlobUtil.fs.unlink(downloadDir);
  } catch (error) {
    logErrorToSentry('[INFO][removeAllStorage]', {
      severity: Sentry.Severity.Info,
      infoMessage: error?.message,
    });
  }
}
