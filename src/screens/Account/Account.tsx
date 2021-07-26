import React, { useCallback, useState } from 'react';
import { Divider } from 'react-native-paper';
import { useErrorHandler } from 'react-error-boundary';
import InAppReview from 'react-native-in-app-review';

import config from 'src/config';
import { styled } from 'src/paperTheme';
import { openURL } from 'src/utils/linking';
import Row from 'src/components/Row';
import { LoginStore } from 'src/pullstate/loginStore';
import ConnectionBanner from 'src/components/ConnectionBanner';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';
import { logoutAction } from 'src/pullstate/actions';
import ClearDataRow from 'src/screens/Account/ClearDataRow';
import LogoutDialog from 'src/screens/Account/LogoutDialog';

import DownloadRow from './DownloadRow';

const Container = styled.View`
  flex: 1;
`;

const appVersionAndBuild = `${config.APP_VERSION} (${config.APP_BUILD})`;

const metadata = `


  ------
  App: ${config.BUNDLE_ID}, ${appVersionAndBuild}
  Device: ${config.MODEL} (${config.PLATFORM_VERSION})
  Locale: ${config.PARSED_LOCALES}
  Platform: ${config.PLATFORM}
`;

const AccountScreen: React.FC = () => {
  const { userData, isStaging } = LoginStore.useState((s) => ({ userData: s.userData, isStaging: s.isStaging }));

  const handleError = useErrorHandler();
  const [visible, setVisible] = useState(false);
  const connected = useNetworkStatus();

  const emailSubject = encodeURIComponent(`${config.APP_NAME} ${appVersionAndBuild}`);
  const emailBody = encodeURIComponent(metadata);

  const showDialog = () => setVisible(true);

  const hideDialog = () => setVisible(false);

  const handleLogout = () => {
    void logoutAction();
  };
  const handleBomb = useCallback(() => {
    try {
      throw new Error('Something went wrong');
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  const handleStart = useCallback(() => {
    //
    if (InAppReview.isAvailable()) {
      // trigger UI InAppreview
      InAppReview.RequestInAppReview()
        .then((hasFlowFinishedSuccessfully) => {
          // when return true in android it means user finished or close review flow
          console.warn('InAppReview in android', hasFlowFinishedSuccessfully);

          // 1- you have option to do something ex: (navigate Home page) (in android).
          // 2- you have option to do something,
          // ex: (save date today to lanuch InAppReview after 15 days) (in android and ios).

          // 3- another option:
          if (hasFlowFinishedSuccessfully) {
            // do something for ios
            // do something for android
          }

          // for android:
          // The flow has finished. The API does not indicate whether the user
          // reviewed or not, or even whether the review dialog was shown. Thus, no
          // matter the result, we continue our app flow.

          // for ios
          // the flow lanuched successfully, The API does not indicate whether the user
          // reviewed or not, or he/she closed flow yet as android, Thus, no
          // matter the result, we continue our app flow.
        })
        .catch((error) => {
          //we continue our app flow.
          // we have some error could happen while lanuching InAppReview,
          // Check table for errors and code number that can return in catch.
          console.warn(error);
        });
    }
  }, []);

  return (
    <Container>
      <ConnectionBanner connected={connected} />
      {!!userData && (
        <>
          <Row
            accessibilityLabel="userInfo"
            label={userData.email}
            value={userData.account.name}
            icon="logout"
            onPress={showDialog}
          />
          <Divider />
          <DownloadRow userData={userData} disabled={!connected} />

          <Divider />
          <Row
            accessibilityLabel="support"
            label="Email Support"
            value="Get help using the app"
            icon="email"
            onPress={() => openURL(`mailto:support@orangeqc.com?subject=${emailSubject}&body=${emailBody}`)}
          />
          <Divider />
          <ClearDataRow disabled={false} />
          <Divider />
          <Row label="App version" value={`${config.APP_NAME} ${appVersionAndBuild}`} />
          {isStaging && (
            <>
              <Divider />
              <Row
                accessibilityLabel="bomb"
                label="Test Error Fallback"
                icon="error"
                value="Crash"
                onPress={handleBomb}
              />
              <Divider />
              <Row label="Environment" value="Staging" />
            </>
          )}
          {isStaging && (
            <>
              <Divider />
              <Row
                accessibilityLabel="rating"
                label="Rating"
                icon="star"
                value="Show in app review"
                onPress={handleStart}
              />
            </>
          )}
          <LogoutDialog visible={visible} hideDialog={hideDialog} handlePress={handleLogout} />
        </>
      )}
    </Container>
  );
};

export default AccountScreen;
