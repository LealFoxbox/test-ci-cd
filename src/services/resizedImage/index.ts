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
    const result = await ImageResizer.createResizedImage(opt.uri, opt.width, opt.height, 'JPEG', 80);
    const newUri = await fileUrlCopy(result.uri, opt.fileName);
    return newUri;
  } catch (error) {
    try {
      // we try the original photo without resize
      const newUri = await fileUrlCopy(opt.uri, opt.fileName);
      logErrorToSentry('[INFO][resizedImage]', {
        severity: Sentry.Severity.Info,
        infoMessage: error?.message,
      });
      return newUri;
    } catch (error) {
      logErrorToSentry('[INFO][resizedImage - original]', {
        severity: Sentry.Severity.Info,
        infoMessage: error?.message,
      });
      return '';
    }
  }
}
