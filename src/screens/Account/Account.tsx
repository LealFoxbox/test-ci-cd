import React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';

import { useUserSession } from 'src/contexts/userSession';
import sensitiveStorage from 'src/utils/sensitiveStorage';

const AccountScreen: React.FC<{}> = () => {
  const [, dispatch] = useUserSession();

  const handleLogout = async () => {
    await sensitiveStorage.clearAll();
    dispatch({ type: 'logout' });
  };

  return (
    <View>
      <Button mode="contained" onPress={handleLogout} style={{ width: 120, alignSelf: 'center', marginTop: 15 }} dark>
        Logout
      </Button>
    </View>
  );
};

export default AccountScreen;
