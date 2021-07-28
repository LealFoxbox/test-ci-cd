import * as Sentry from '@sentry/react-native';
import Rate, { AndroidMarket } from 'react-native-rate';
import { Alert } from 'react-native';
import { getBundleId } from 'react-native-device-info';

import { logErrorToSentry } from 'src/utils/logger';

export async function rate({ inApp }: { inApp?: boolean } = { inApp: false }): Promise<boolean> {
  try {
    const options = {
      GooglePackageName: getBundleId(),
      preferredAndroidMarket: AndroidMarket.Google,
      preferInApp: inApp,
      openAppStoreIfInAppFails: true,
    };
    return new Promise((resolve, reject) => {
      Rate.rate(options, (success) => {
        if (success) {
          resolve(true);
          // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
        } else {
          reject(false);
        }
      });
    });
  } catch (error) {
    logErrorToSentry('[ERROR][rate]', {
      severity: Sentry.Severity.Error,
      infoMessage: error?.message,
    });
    return false;
  }
}

export async function requestRate(): Promise<boolean> {
  const agreedToRate = await new Promise((resolve) => {
    Alert.alert('Do you enjoy using OrangeQC', '', [
      { text: 'Yes', onPress: () => resolve(true) },
      { text: 'No', style: 'destructive', onPress: () => resolve(false) },
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
    ]);
  });
  if (agreedToRate) {
    return await rate({ inApp: true });
  }
  return false;
}
