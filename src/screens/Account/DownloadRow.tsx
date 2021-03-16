import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { ProgressBar, useTheme } from 'react-native-paper';
import { format } from 'date-fns';

import Row from 'src/components/Row';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { DownloadStore } from 'src/pullstate/downloadStore';
import { INSPECTIONS_HOME } from 'src/navigation/screenNames';
import { clearInspectionsDataAction } from 'src/pullstate/actions';
import { User } from 'src/types';

const DownloadRow: React.FC<{ userData: User; disabled: boolean }> = ({ userData, disabled }) => {
  const lastUpdated = PersistentUserStore.useState((s) => s.lastUpdated);
  const { progress, error } = DownloadStore.useState((s) => ({ progress: s.progress, error: s.error }));
  const theme = useTheme();
  const navigation = useNavigation();

  const handleRedownload = async () => {
    await clearInspectionsDataAction({
      invalidateUserData: true,
      companyId: userData?.account.subdomain,
      token: userData?.single_access_token,
    });

    navigation.reset({
      index: 0,
      routes: [{ name: INSPECTIONS_HOME, params: { parentId: null } }],
    });
  };

  if (error) {
    return (
      <Row
        accessibilityLabel="download"
        label="Download New Data"
        icon="cloud-download"
        onPress={handleRedownload}
        disabled={disabled}
      />
    );
  }

  if (progress === 100 && lastUpdated) {
    return (
      <Row
        accessibilityLabel="download"
        label="Download New Data"
        value={`Last updated ${format(lastUpdated, 'MM/dd/yyyy hh:mma')}`}
        icon="cloud-download"
        onPress={handleRedownload}
        disabled={disabled}
      />
    );
  }

  return (
    <Row
      accessibilityLabel="downloading"
      label="Downloading Data..."
      value={
        <ProgressBar
          progress={progress / 100}
          color={theme.colors.primary}
          style={{ maxWidth: 250, marginVertical: 5 }}
        />
      }
      icon="cloud-download"
    />
  );
};

export default DownloadRow;
