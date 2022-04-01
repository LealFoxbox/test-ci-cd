import ImageResizer from 'react-native-image-resizer';
import * as Sentry from '@sentry/react-native';

import { logErrorToSentry } from 'src/utils/logger';
import { fileUrlCopy } from 'src/screens/Inspections/FormCards/MoreButton';

import { ImageLocation } from '../imageHandler/imagePicker';

type ResizedImageOptions = ImageLocation & {
  width: number;
  height: number;
};

export async function resizeImage(photo: ResizedImageOptions): Promise<string> {
  try {
    const result = await ImageResizer.createResizedImage(photo.uri, photo.width, photo.height, 'JPEG', 80);
    const newUri = await fileUrlCopy(result.uri, photo.fileName);
    return newUri;
  } catch (error) {
    try {
      // we try the original photo without resize
      const newUri = await fileUrlCopy(photo.uri, photo.fileName);
      logErrorToSentry('[ERROR][resizedImage]', {
        severity: Sentry.Severity.Error,
        original: photo,
        error: error,
      });
      return newUri;
      // eslint-disable-next-line no-catch-shadow
    } catch (error) {
      logErrorToSentry('[ERROR][resizedImage - original]', {
        severity: Sentry.Severity.Error,
        error: error,
      });
      return '';
    }
  }
}
