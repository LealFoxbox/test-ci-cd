import React from 'react';
import { Button, Dialog, Paragraph, Portal, useTheme } from 'react-native-paper';

import { styled } from 'src/paperTheme';

const NoButton = styled(Button)`
  margin-right: 10px;
`;

interface LogoutDialog {
  visible: boolean;
  hideDialog: () => void;
  handlePress: () => void;
}

const LogoutDialog: React.FC<LogoutDialog> = ({ visible, hideDialog, handlePress }) => {
  const theme = useTheme();

  return (
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
          <Button color={theme.colors.accent} onPress={handlePress}>
            Sign Out
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default LogoutDialog;
