import React from 'react';
import { Button } from 'react-native-paper';

import config from 'src/config';
import { useUserSession } from 'src/contexts/userSession';
import { styled } from 'src/paperTheme';
import { openURL } from 'src/utils/linking';
import sensitiveStorage from 'src/utils/sensitiveStorage';

import Row from './Row';

const Container = styled.View`
  margin: 10px;
  flex: 1;
`;

const AccountScreen: React.FC<{}> = () => {
  const [{ data: user }, dispatch] = useUserSession();

  const handleLogout = async () => {
    await sensitiveStorage.clearAll();
    dispatch({ type: 'logout' });
  };

  const version = `v${config.RELEASE_VERSION || '0.0.1'}`;

  return (
    <Container>
      {!!user && (
        <>
          <Row label={user.email} value={user.account.name} />
          <Row
            label="Email Support"
            value="Get help using the app"
            onPress={() => openURL(`mailto:support@orangeqc.com?subject=Help!&body=Sent from App version ${version}`)}
          />
          <Row label="App version" value={version} />
        </>
      )}
      <Button mode="contained" onPress={handleLogout} style={{ width: 120, alignSelf: 'center', marginTop: 15 }} dark>
        Logout
      </Button>
    </Container>
  );
};

export default AccountScreen;
