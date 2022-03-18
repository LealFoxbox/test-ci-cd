import { PermissionsAndroid } from 'react-native';
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import * as Sentry from '@sentry/react-native';

import { errorMessages } from 'src/utils/errorMessages';
import { logErrorToSentry } from 'src/utils/logger';

import { askWriteStoragePermission } from '../storage';

export interface ImageHandled {
  data?: ImagePickerResponse & {
    uri: string;
    fileName: string;
  };
  error?: string;
}

async function askCameraPermission() {
  try {
    const response = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: 'Camera Access Permission',
      message: 'We would like to use your camera',
      buttonPositive: 'Okay',
    });

    return response === PermissionsAndroid.RESULTS.GRANTED;
  } catch (e) {
    return false;
  }
}

const handleImages = (result: ImagePickerResponse): ImageHandled => {
  try {
    if (result?.didCancel) {
      return {};
    }

    if (!result.assets || !result.assets.length || !result.assets?.[0].uri) {
      logErrorToSentry('[ERROR][Assets not ok when handling camera/gallery]', {
        severity: Sentry.Severity.Error,
        result,
        error: errorMessages.generic_problem,
      });
      return { error: errorMessages.generic_problem };
    }

    if (result?.errorCode && result?.errorCode === 'permission') {
      logErrorToSentry(`[ERROR]${errorMessages.permission}`, {
        severity: Sentry.Severity.Error,
        result,
        error: errorMessages.permission,
      });
      return { error: errorMessages.permission };
    }

    if (result?.errorCode && result?.errorCode === 'camera_unavailable') {
      logErrorToSentry(`[ERROR]${errorMessages.camera_unavailable}`, {
        severity: Sentry.Severity.Error,
        result,
        error: errorMessages.camera_unavailable,
      });
      return { error: errorMessages.camera_unavailable };
    }

    if (result?.errorCode && result?.errorCode === 'others') {
      logErrorToSentry(`[ERROR]${errorMessages.generic_problem}`, {
        severity: Sentry.Severity.Error,
        result,
        error: result?.errorMessage || errorMessages.generic_problem,
      });
      return { error: result?.errorMessage || errorMessages.generic_problem };
    }

    const fileName = `photo - ${Date.now()}.jpg`;
    const uri = result.assets[0].uri;
    return { data: { uri, fileName } };
  } catch (error) {
    logErrorToSentry(`[ERROR][handleImage process error]`, {
      severity: Sentry.Severity.Error,
      result,
      error: error as Error,
    });
    return {};
  }
};

export async function handleCamera(): Promise<ImageHandled> {
  const hasPermission = await askCameraPermission();
  if (!hasPermission) {
    return {};
  }
  const result = await launchCamera({
    mediaType: 'photo',
    quality: 0.3,
    saveToPhotos: true,
  });
  return handleImages(result);
}

export async function handleGallery(): Promise<ImageHandled> {
  const hasPermission = await askWriteStoragePermission();
  if (!hasPermission) {
    return {};
  }
  const result = await launchImageLibrary({
    mediaType: 'photo',
    maxWidth: 500, //	To resize the image
    maxHeight: 500, //	To resize the image
    quality: 0.4, //	0 to 1, photos
    includeBase64: false,
  });
  return handleImages(result);
}
