import React, { useState } from 'react';
import { useTheme } from 'react-native-paper';

import Row from 'src/components/Row';
import { clearAllDataAction } from 'src/pullstate/actions';
import ClearDataDialog from 'src/screens/Account/ClearDataDialog';
import LoadingOverlay from 'src/components/LoadingOverlay';

const ClearDataRow: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();

  const showDialog = () => setVisible(true);

  const hideDialog = () => setVisible(false);

  const handleDeleteData = async () => {
    hideDialog();
    setLoading(true);
    await clearAllDataAction();
  };

  return (
    <>
      <Row
        accessibilityLabel="clear-data"
        label="Clear Data"
        icon="delete-sweep"
        onPress={showDialog}
        disabled={disabled}
        titleColor={theme.colors.error}
        iconColor={theme.colors.error}
      />
      <ClearDataDialog visible={visible} hideDialog={hideDialog} handlePress={handleDeleteData} />
      {loading && <LoadingOverlay backgroundColor={'rgba(0, 0, 0, 0)'} />}
    </>
  );
};

export default ClearDataRow;
