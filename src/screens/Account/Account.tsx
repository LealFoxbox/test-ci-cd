import React from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Dialog, Divider, Paragraph, Portal, useTheme } from 'react-native-paper';

import config from 'src/config';
import { useUserSession } from 'src/contexts/userSession';
import { styled } from 'src/paperTheme';
import { openURL } from 'src/utils/linking';
import sensitiveStorage from 'src/utils/sensitiveStorage';
import Row from 'src/components/Row';

const Container = styled.View`
  flex: 1;
`;

const NoButton = styled(Button)`
  margin-right: 10px;
`;

const AccountScreen: React.FC<{}> = () => {
  const [{ data: user }, dispatch] = useUserSession();
  const [visible, setVisible] = React.useState(false);
  const theme = useTheme();

  const emailSubject = encodeURIComponent(config.APP_VERSION);
  const emailBody = !user
    ? ''
    : encodeURIComponent(`
Email: ${user.email}
Name: ${user.first_name} ${user.last_name}
Account name: ${user.account.name}
Account subdomain: ${user.account.name}
Login: ${user.login}
`);

  const showDialog = () => setVisible(true);

  const hideDialog = () => setVisible(false);

  const handleLogout = async () => {
    await sensitiveStorage.clearAll();
    dispatch({ type: 'logout' });
  };

  useFocusEffect(() => {
    const handleBackButton = () => {
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  });

  return (
    <Container>
      {!!user && (
        <>
          <Row
            accessibilityLabel="userInfo"
            label={user.email}
            value={user.account.name}
            icon="logout"
            onPress={showDialog}
          />
          <Divider />
          <Row
            accessibilityLabel="support"
            label="Email Support"
            value="Get help using the app"
            icon="email"
            onPress={() => openURL(`mailto:support@orangeqc.com?subject=${emailSubject}&body=${emailBody}`)}
          />
          <Divider />
          <Row label="App version" value={config.APP_VERSION} />
          {config.isStaging && (
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
