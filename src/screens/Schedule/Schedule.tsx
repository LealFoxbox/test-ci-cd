import React, { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import WebView from 'react-native-webview';
import { useNavigation } from '@react-navigation/core';
import { find } from 'lodash/fp';
import { useFocusEffect } from '@react-navigation/native';

import { SCHEDULE_INSPECTIONS_FORM } from 'src/navigation/screenNames';
import { InspectionFormParams } from 'src/navigation/InspectionsNavigator';
import { initFormDraftAction } from 'src/pullstate/formActions';
import { LoginStore } from 'src/pullstate/loginStore';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import WebViewScreen from 'src/components/WebViewScreen';
import { assignmentsDb, structuresDb } from 'src/services/mongodb';
import { urlMatch } from 'src/utils/urlMatch';
import { User } from 'src/types';

function getScheduleUri(user: User) {
  return `${user.features.schedule_feature.url}&user_credentials=${user.single_access_token}`;
}

const ScheduleScreen: React.FC<{}> = () => {
  const webRef = useRef<WebView>(null);
  const { userData, isStaging } = LoginStore.useState((s) => ({ userData: s.userData, isStaging: s.isStaging }));
  const uploads = PersistentUserStore.useState((s) =>
    s.uploads.filter((item) => !!item.submittedAt && !!item?.draft?.eventId),
  );
  // we use refresh webview as ref to reload the webview schedule when it's in stack navigation
  const refreshWebview = useRef<boolean>(false);

  const navigation = useNavigation();

  useEffect(() => {
    // If the screen is in the stack and uploads have changed, this lets us know that the screen needs to render the next time when it's a focus.
    refreshWebview.current = true;
  }, [uploads]);

  useFocusEffect(
    useCallback(() => {
      if (webRef.current && refreshWebview.current) {
        webRef.current.reload();
        refreshWebview.current = false;
      }
    }, []),
  );

  if (!userData) {
    return <View />;
  }

  return (
    <WebViewScreen
      ref={webRef}
      source={{ uri: getScheduleUri(userData) }}
      onNavigationStateChange={({ url }) => {
        // the url we care about: ["inspect", "areas", "570573", "inspection_forms", "74342"]

        const match = urlMatch(url, ['inspect', 'areas', '*', 'inspection_forms', '*'], { inspection_event_id: '*' });

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
  );
};

export default ScheduleScreen;
