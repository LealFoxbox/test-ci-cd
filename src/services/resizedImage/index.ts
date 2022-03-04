import ImageResizer, { ResizeFormat, ResizeMode } from 'react-native-image-resizer';
import * as Sentry from '@sentry/react-native';

import { logErrorToSentry } from 'src/utils/logger';
import { fileUrlCopy } from 'src/screens/Inspections/FormCards/MoreButton';

type ResizedImageOptions = {
  uri: string;
  width: number;
  height: number;
  format?: ResizeFormat;
  quality?: number;
  rotation?: number;
  outputPath?: string;
  keepMeta?: boolean;
  fileName: string;
  options?: {
    mode?: ResizeMode;
    onlyScaleDown?: boolean;
  };
};

export async function resizedImage(opt: ResizedImageOptions): Promise<string> {
  try {
    const start = Date.now();
    logErrorToSentry('[INFO][resizedImage] resize process started', {
      severity: Sentry.Severity.Info,
      object: opt,
      timeStarted: start,
    });
    const result = await ImageResizer.createResizedImage(opt.uri, opt.width, opt.height, 'JPEG', 25);
    logErrorToSentry('[INFO][createResizedImage] createResizedImage process started', {
      severity: Sentry.Severity.Info,
      object: result,
      timeSpent: Date.now() - start,
    });
    const newUri = await fileUrlCopy(result.uri, opt.fileName);
    logErrorToSentry('[INFO][fileUrlCopy] fileUrlCopy process finished', {
      severity: Sentry.Severity.Info,
      object: result,
      timeSpent: Date.now() - start,
    });
    logErrorToSentry('[INFO][resizedImage] resize process finished', {
      severity: Sentry.Severity.Info,
      object: opt,
      timeStarted: Date.now() - start,
    });
    return newUri;
  } catch (error) {
    try {
      // we try the original photo without resize
      const newUri = await fileUrlCopy(opt.uri, opt.fileName);
      logErrorToSentry('[ERROR][resizedImage]', {
        severity: Sentry.Severity.Error,
        infoMessage: error?.message,
      });
      return newUri;
      // eslint-disable-next-line no-catch-shadow
    } catch (error) {
      logErrorToSentry('[ERROR][resizedImage - original]', {
        severity: Sentry.Severity.Error,
        infoMessage: error?.message,
      });
      return '';
    }
  }
}
