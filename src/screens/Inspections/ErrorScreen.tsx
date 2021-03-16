import React from 'react';
import { Button, Title } from 'react-native-paper';

import ConnectionBanner from 'src/components/ConnectionBanner';
import { styled } from 'src/paperTheme';
import { clearInspectionsDataAction } from 'src/pullstate/actions';
import { User } from 'src/types';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';

const MessageContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 30px;
`;

const ErrorScreen: React.FC<{ userData: User }> = ({ userData }) => {
  const connected = useNetworkStatus();

  return (
    <>
      <ConnectionBanner connected={connected} />
      <MessageContainer>
        <Title style={{ textAlign: 'center', marginBottom: 15 }}>
          An error has ocurred while downloading, please try again
        </Title>
        <Button
          mode="contained"
          disabled={!connected}
          dark
          accessibilityLabel="download"
          icon="cloud-download"
          onPress={() => {
            void clearInspectionsDataAction({
              invalidateUserData: true,
              companyId: userData.account.subdomain,
              token: userData.single_access_token,
            });
          }}
        >
          Download
        </Button>
      </MessageContainer>
    </>
  );
};

export default ErrorScreen;
