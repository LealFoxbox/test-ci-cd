import * as Sentry from '@sentry/react-native';
import Rate, { AndroidMarket } from 'react-native-rate';
import { Alert } from 'react-native';
import { getBundleId } from 'react-native-device-info';
import InAppReview from 'react-native-in-app-review';

import { logErrorToSentry } from 'src/utils/logger';

export async function rateInApp(): Promise<boolean> {
  try {
    const isAvailable = InAppReview.isAvailable();
    if (isAvailable) {
      const hasFlowFinishedSuccessfully = await InAppReview.RequestInAppReview();
      // when return true in android it means user finished or close review flow
      // ex: (save date today to lanuch InAppReview after 15 days) (in android and ios).
      // The flow has finished. The API does not indicate whether the user
      // reviewed or not, or even whether the review dialog was shown. Thus, no
      // matter the result, we continue our app flow.
      return !!hasFlowFinishedSuccessfully;
    }
    return false;
  } catch (error) {
    logErrorToSentry('[ERROR][rateInApp]', {
      severity: Sentry.Severity.Error,
      infoMessage: error?.message,
    });
    return false;
  }
}

export async function rate(): Promise<boolean> {
  try {
    const options = {
      GooglePackageName: getBundleId(),
      preferredAndroidMarket: AndroidMarket.Google,
      preferInApp: false,
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
    return await rate();
  }
  return false;
}
