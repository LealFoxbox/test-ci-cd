import { useEffect } from 'react';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { useTrigger } from 'src/utils/useTrigger';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';

const FLAGS = {
  loggedIn: false,
};

export function useUploader() {
  const [shouldTrigger, setShouldTrigger] = useTrigger();
  const token = PersistentUserStore.useState((s) => s.userData?.single_access_token);
  const inspectionsEnabled = PersistentUserStore.useState((s) => s.userData?.features.inspection_feature.enabled);
  const subdomain = PersistentUserStore.useState((s) => s.userData?.account.subdomain);
  const connected = useNetworkStatus();

  useEffect(() => {
    if (!token) {
      FLAGS.loggedIn = false;
    } else if (shouldTrigger && subdomain) {
      FLAGS.loggedIn = true;
      if (inspectionsEnabled && connected) {
        // TODO: upload logic goes here
      }
    }
  }, [shouldTrigger, token, subdomain, inspectionsEnabled, connected]);

  return setShouldTrigger;
}
