import React from 'react';
import { Button, Dialog, Paragraph, Portal, useTheme } from 'react-native-paper';

import { styled } from 'src/paperTheme';

const NoButton = styled(Button)`
  margin-right: 10px;
`;

interface DeleteUploadDialog {
  onConfirm: () => void;
  hideDialog: () => void;
  visible: boolean;
}

const DeleteUploadDialog: React.FC<DeleteUploadDialog> = ({ onConfirm, visible, hideDialog }) => {
  const theme = useTheme();

  const handleConfirm = () => {
    hideDialog();
    onConfirm();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Title>Delete an Inspection</Dialog.Title>
        <Dialog.Content>
          <Paragraph>This inspection has not been uploaded. Deleting it will remove it. Are you sure?</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <NoButton color={theme.colors.placeholder} onPress={hideDialog}>
            Cancel
          </NoButton>
          <Button color={theme.colors.accent} onPress={handleConfirm}>
            Yes
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
export default DeleteUploadDialog;
