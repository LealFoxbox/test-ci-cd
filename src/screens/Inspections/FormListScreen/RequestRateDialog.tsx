import React, { useCallback } from 'react';
import { Button, Dialog, Portal, useTheme } from 'react-native-paper';
import * as Sentry from '@sentry/react-native';

import { styled } from 'src/paperTheme';
import { rate, rateInApp } from 'src/services/rate';
import { rateAction } from 'src/pullstate/actions';
import config from 'src/config';
import { logErrorToSentry } from 'src/utils/logger';

const NoButton = styled(Button)`
  margin-right: 10px;
`;

interface RequestRateDialog {
  hideDialog: () => void;
  visible: boolean;
}

const RequestRateDialog: React.FC<RequestRateDialog> = ({ visible, hideDialog }) => {
  const theme = useTheme();

  const handleConfirm = useCallback(async () => {
    try {
      hideDialog();
      // try with in app review
      const rateResult = await rateInApp();
      if (!rateResult) {
        // try to redirect to play store
        await rate();
      }
      rateAction({
        appBuild: config.APP_BUILD,
        isRateCompleted: true,
      });
    } catch (error) {
      logErrorToSentry('[ERROR][RequestRateDialog]', {
        severity: Sentry.Severity.Error,
        infoMessage: error?.message,
      });
    }
  }, [hideDialog]);

  const handleHideDialog = useCallback(() => {
    hideDialog();
    rateAction({
      appBuild: config.APP_BUILD,
      isRateCompleted: true,
    });
  }, [hideDialog]);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog} dismissable={false}>
        <Dialog.Title>Do you enjoy using OrangeQC?</Dialog.Title>
        <Dialog.Actions>
          <NoButton color={theme.colors.placeholder} onPress={handleHideDialog}>
            No
          </NoButton>
          <NoButton color={theme.colors.placeholder} onPress={handleHideDialog}>
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
export default RequestRateDialog;
