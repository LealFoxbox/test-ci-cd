import React from 'react';
import { Button, Dialog, Divider, Paragraph, Portal, useTheme } from 'react-native-paper';

import config from 'src/config';
import { styled } from 'src/paperTheme';
import { openURL } from 'src/utils/linking';
import Row from 'src/components/Row';
import { LoginStore } from 'src/pullstate/loginStore';
import ConnectionBanner from 'src/components/ConnectionBanner';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';
import { logoutAction } from 'src/pullstate/actions';

import DownloadRow from './DownloadRow';

const Container = styled.View`
  flex: 1;
`;

const NoButton = styled(Button)`
  margin-right: 10px;
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

  const [visible, setVisible] = React.useState(false);
  const theme = useTheme();
  const connected = useNetworkStatus();

  const emailSubject = encodeURIComponent(`${config.APP_NAME} ${appVersionAndBuild}`);
  const emailBody = encodeURIComponent(metadata);

  const showDialog = () => setVisible(true);

  const hideDialog = () => setVisible(false);

  const handleLogout = () => {
    void logoutAction();
  };

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
          <Row label="App version" value={`${config.APP_NAME} ${appVersionAndBuild}`} />
          {isStaging && (
            <>
              <Divider />
              <Row label="Environment" value="Staging" />
            </>
          )}
          <Portal>
            <Dialog visible={visible} onDismiss={hideDialog}>
              <Dialog.Title>Sign out</Dialog.Title>
              <Dialog.Content>
                <Paragraph>Are you sure you want to sign out?</Paragraph>
              </Dialog.Content>
              <Dialog.Actions>
                <NoButton color={theme.colors.placeholder} onPress={hideDialog}>
                  Cancel
                </NoButton>
                <Button color={theme.colors.accent} onPress={handleLogout}>
                  Sign Out
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </>
      )}
    </Container>
  );
};

export default AccountScreen;
