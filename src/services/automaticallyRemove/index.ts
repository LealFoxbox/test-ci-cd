import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { orderBy } from 'lodash/fp';
import { addDays, addHours, compareAsc } from 'date-fns';

import { LoginStore } from 'src/pullstate/loginStore';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { deleteUploadAction } from 'src/pullstate/uploaderActions';
import { useTrigger } from 'src/utils/useTrigger';

const DAYS_TO_REMOVE = 14;
const HOURS_TO_REMOVE = 1;

export function useAutomaticallyRemove(): ReturnType<typeof useTrigger> {
  const [shouldTrigger, setShouldTrigger, resetTrigger] = useTrigger();
  const { token, isStaging } = LoginStore.useState((s) => ({
    token: s.userData?.single_access_token,
    isStaging: s.isStaging,
  }));
  const pendingUploads = PersistentUserStore.useState((s) =>
    s.pendingUploads.concat(orderBy('submittedAt', 'desc', s.uploads)),
  );

  const appState = useRef<string | undefined>(AppState.currentState);

  const removePendingUploadsSubmitted = useCallback(() => {
    try {
      if (shouldTrigger && token && pendingUploads?.length) {
        // get remove pendingUploads
        for (const currentUpload of pendingUploads) {
          if (currentUpload?.submittedAt) {
            if (isStaging) {
              const deleteDate = addHours(new Date(currentUpload.submittedAt), HOURS_TO_REMOVE);
              if (compareAsc(deleteDate, new Date()) === -1) {
                deleteUploadAction(currentUpload.draft.guid);
              }
            } else {
              const deleteDate = addDays(new Date(currentUpload.submittedAt), DAYS_TO_REMOVE);
              if (compareAsc(deleteDate, new Date()) === -1) {
                deleteUploadAction(currentUpload.draft.guid);
              }
            }
          }
        }
      }
    } catch (error) {
      console.log('remove ', error?.message);
    }
  }, [isStaging, pendingUploads, shouldTrigger, token]);

  const handleAppStateChange = useCallback(
    (nextAppState: string) => {
      if (appState.current?.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        removePendingUploadsSubmitted();
      }
      appState.current = nextAppState;
    },
    [removePendingUploadsSubmitted],
  );

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, [handleAppStateChange]);

  return [shouldTrigger, setShouldTrigger, resetTrigger];
}
