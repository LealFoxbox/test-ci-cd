import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import { Button, Dialog, Paragraph, Portal, useTheme } from 'react-native-paper';

import { styled } from 'src/paperTheme';

import { EasterEgg } from './styles';

const NoButton = styled(Button)`
  margin-right: 10px;
`;

interface StagingDialog {
  onConfirm: () => void;
}

const StagingDialog: React.FC<StagingDialog> = ({ onConfirm }) => {
  const theme = useTheme();
  const [visible, setVisible] = React.useState(false);

  const showDialog = () => setVisible(true);

  const hideDialog = () => setVisible(false);

  const handleConfirm = () => {
    hideDialog();
    onConfirm();
  };

  return (
    <>
      <TouchableWithoutFeedback delayLongPress={2000} accessibilityRole="none" onLongPress={showDialog}>
        <EasterEgg />
      </TouchableWithoutFeedback>
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
    </>
  );
};
export default StagingDialog;
