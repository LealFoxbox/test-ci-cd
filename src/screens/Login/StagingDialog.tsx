import React from 'react';
import { Button, Dialog, Paragraph, Portal, useTheme } from 'react-native-paper';

import { styled } from 'src/paperTheme';

const NoButton = styled(Button)`
  margin-right: 10px;
`;

interface StagingDialog {
  onConfirm: () => void;
  hideDialog: () => void;
  visible: boolean;
}

const StagingDialog: React.FC<StagingDialog> = ({ onConfirm, visible, hideDialog }) => {
  const theme = useTheme();

  const handleConfirm = () => {
    hideDialog();
    onConfirm();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Title>Alert</Dialog.Title>
        <Dialog.Content>
          <Paragraph>Are you sure you want to change environments?</Paragraph>
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
export default StagingDialog;
