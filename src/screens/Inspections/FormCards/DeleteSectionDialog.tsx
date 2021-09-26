import React from 'react';
import { Button, Dialog, Paragraph, Portal, useTheme } from 'react-native-paper';

import { styled } from 'src/paperTheme';

const NoButton = styled(Button)`
  margin-right: 10px;
`;

interface DeleteSectionDialog {
  visible: boolean;
  hideDialog: () => void;
  handlePress: () => void;
}

const DeleteSectionDialog: React.FC<DeleteSectionDialog> = ({ visible, hideDialog, handlePress }) => {
  const theme = useTheme();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Content>
          <Paragraph>This section and its items will be removed from the inspection</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <NoButton color={theme.colors.accent} onPress={hideDialog}>
            Cancel
          </NoButton>
          <Button color={theme.colors.error} onPress={handlePress}>
            Delete Section
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default DeleteSectionDialog;
