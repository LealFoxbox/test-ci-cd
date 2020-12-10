import { useEffect } from 'react';

import { setEnv } from 'src/config';

import { PersistentUserStore } from './persistentStore';

export const UserSessionEffect = () => {
  useEffect(
    () =>
      PersistentUserStore.subscribe(
        (s) => s.isStaging,
        (isStaging) => {
          setEnv(isStaging);
        },
      ),
    [],
  );

  return null;
};
