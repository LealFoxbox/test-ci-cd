import React from 'react';
import { View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { INSPECTIONS_FORM } from 'src/navigation/screenNames';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';
import FormScreen from 'src/components/FormScreen';
import { User } from 'src/types';
import { getBaseUrl } from 'src/services/api/utils';

function getFormUri(user: User, structureId: number, formId: number) {
  return `${getBaseUrl(
    user.account.subdomain,
  )}/inspect/areas/${structureId}/inspection_forms/${formId}?mobile_app=1&user_credentials=${user.single_access_token}`;
}

const EditFormScreen: React.FC<{}> = () => {
  const userData = PersistentUserStore.useState((s) => s.userData);
  const {
    params: { formId, structureId },
  } = useRoute<RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_FORM>>();

  if (!userData || !formId || !structureId) {
    return <View />;
  }

  return <FormScreen source={{ uri: getFormUri(userData, structureId, formId) }} />;
};

export default EditFormScreen;
