import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import WebView from 'react-native-webview';
import { useNavigation } from '@react-navigation/core';
import { find } from 'lodash/fp';

import { SCHEDULE_INSPECTIONS_FORM } from 'src/navigation/screenNames';
import { InspectionFormParams } from 'src/navigation/InspectionsNavigator';
import { initFormDraftAction } from 'src/pullstate/formActions';
import { LoginStore } from 'src/pullstate/loginStore';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import WebViewScreen from 'src/components/WebViewScreen';
import { assignmentsDb, structuresDb } from 'src/services/mongodb';
import { urlMatch } from 'src/utils/urlMatch';
import { User } from 'src/types';
import usePrevious from 'src/utils/usePrevious';
import LoadingOverlay from 'src/components/LoadingOverlay';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';

function getScheduleUri(user: User) {
  return `${user.features.schedule_feature.url}&user_credentials=${user.single_access_token}`;
}

const ScheduleScreen: React.FC<{}> = () => {
  const webRef = useRef<WebView>(null);
  const connected = useNetworkStatus();
  const { userData, isStaging } = LoginStore.useState((s) => ({ userData: s.userData, isStaging: s.isStaging }));
  const pendingScheduleUploadsLength = PersistentUserStore.useState(
    (s) => s.pendingUploads.filter((pending) => !!pending.draft.eventId).length,
  );
  const previousPendingScheduledUploadsLength = usePrevious(pendingScheduleUploadsLength);
  const navigation = useNavigation();

  useEffect(() => {
    if (!!previousPendingScheduledUploadsLength && pendingScheduleUploadsLength === 0 && connected) {
      webRef?.current?.reload();
    }
  }, [previousPendingScheduledUploadsLength, pendingScheduleUploadsLength, connected]);

  if (!userData) {
    return <View />;
  }

  return (
    <>
      <WebViewScreen
        ref={webRef}
        source={{ uri: getScheduleUri(userData) }}
        onNavigationStateChange={({ url }) => {
          // the url we care about: ["inspect", "areas", "570573", "inspection_forms", "74342"]

          const match = urlMatch(url, ['inspect', 'areas', '*', 'inspection_forms', '*'], {
            inspection_event_id: '*',
          });

          if (match && typeof match.searchValues.inspection_event_id === 'string') {
            const formId = parseInt(match.pathValues[1], 10);
            const { ratings, drafts, forms } = PersistentUserStore.getRawState();
            const form = forms[formId];

            if (!form) {
              // we don't have the info necessary, let's just continue using the webview
              return;
            }

            const structureId = parseInt(match.pathValues[0], 10);
            const eventId = match.searchValues.inspection_event_id;
            const draftId = `eventId${eventId}`;

            (async () => {
              const assignments = await assignmentsDb.getAssignments(structureId);
              const assignment = find({ inspection_form_id: formId }, assignments);

              if (!assignment) {
                // we don't have the info necessary, let's just continue using the webview
                return;
              }

              if (!drafts[draftId]) {
                const coords = { latitude: null, longitude: null };

                const structure = await structuresDb.get(structureId);
                if (!structure) {
                  // we don't have the info necessary, let's just continue using the webview
                  return;
                }

                initFormDraftAction({
                  form,
                  isStaging,
                  eventId,
                  ratings,
                  coords,
                  structureId,
                  structure,
                  assignmentId: assignment.id,
                });
              }

              const p: InspectionFormParams = {
                assignmentId: assignment.id,
                title: form.name,
              };

              webRef.current?.goBack();
              navigation.navigate(SCHEDULE_INSPECTIONS_FORM, p);
            })();
          }
        }}
      />
      {pendingScheduleUploadsLength > 0 && connected && <LoadingOverlay />}
    </>
  );
};

export default ScheduleScreen;
