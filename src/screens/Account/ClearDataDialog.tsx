import React from 'react';
import { Button, Dialog, Paragraph, Portal, useTheme } from 'react-native-paper';

import { styled } from 'src/paperTheme';

const NoButton = styled(Button)`
  margin-right: 10px;
`;

interface ClearDataDialog {
  visible: boolean;
  hideDialog: () => void;
  handlePress: () => void;
}

const ClearDataDialog: React.FC<ClearDataDialog> = ({ visible, hideDialog, handlePress }) => {
  const theme = useTheme();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Title>Delete App Data!</Dialog.Title>
        <Dialog.Content>
          <Paragraph>Are you sure you want to do this?</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <NoButton color={theme.colors.placeholder} onPress={hideDialog}>
            No
          </NoButton>
          <Button color={theme.colors.error} onPress={handlePress}>
            Yes
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ClearDataDialog;
