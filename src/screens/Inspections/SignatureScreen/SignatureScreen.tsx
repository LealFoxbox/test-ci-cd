import React, { useRef, useState } from 'react';
import { Button } from 'react-native-paper';
import SignatureCapture from 'react-native-signature-capture';
import RNFS from 'react-native-fs';
import { directories } from 'react-native-background-downloader';
import { get, set } from 'lodash/fp';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { updateDraftFieldsAction } from 'src/pullstate/actions';
import { styled } from 'src/paperTheme';
import { SIGNATURE_MODAL } from 'src/navigation/screenNames';
import { MainNavigatorParamList } from 'src/navigation/MainStackNavigator';
import { DraftField, DraftPhoto } from 'src/types';

const Container = styled.View`
  flex: 1;
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;
`;

const ButtonsContainer = styled.View`
  width: 70%;
  align-self: flex-end;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
  margin-right: 24px;
`;

const SignatureScreen: React.FC = () => {
  const signatureRef = useRef<SignatureCapture>(null);
  const [userHasSigned, setUserHasSigned] = useState(false);
  const {
    params: { assignmentId, formFieldId },
  } = useRoute<RouteProp<MainNavigatorParamList, typeof SIGNATURE_MODAL>>();
  const drafts = PersistentUserStore.useState((s) => s.drafts);
  const navigation = useNavigation();

  return (
    <Container>
      <SignatureCapture
        style={{ flex: 1, width: '100%' }}
        ref={signatureRef}
        onSaveEvent={({ encoded }) => {
          // const imageBase64 = `data:image/png;base64,${encoded}`;

          const path = `${directories.documents}/signature - ${Date.now()}.png`;
          RNFS.writeFile(path, encoded, 'base64')
            .then(() => {
              const newPhoto: DraftPhoto = {
                isFromGallery: false,
                uri: path,
                latitude: null, // Latitude where the inspection was started or first available location coordinates
                longitude: null, // Longitude where the inspection was started or first available location coordinates
                created_at: Date.now(), // timestamp in format "2020-01-08T14:52:56-07:00",
              };

              const fields = (get(`${assignmentId}.fields`, drafts) as unknown) as Record<string, DraftField>;

              // const oldPhotos = (get(`${formFieldId}.photos`, fields) as unknown) as DraftPhoto[];

              // TODO: delete old photos!

              const newValues = set(`${formFieldId}.photos`, [newPhoto], fields);
              console.warn('new field values', JSON.stringify(newValues));

              updateDraftFieldsAction(assignmentId, newValues);

              navigation.goBack();
            })
            .catch((err) => {
              console.warn('RNFS writefiile error: ', JSON.stringify(err));
            });
        }}
        onDragEvent={() => {
          setUserHasSigned(true);
        }}
        saveImageFileInExtStorage={false}
        showNativeButtons={false}
        showTitleLabel={false}
        showBorder={false}
        viewMode="portrait"
      />
      <ButtonsContainer>
        <Button
          onPress={() => {
            signatureRef.current && signatureRef.current.resetImage();
            setUserHasSigned(false);
          }}
          disabled={!userHasSigned}
        >
          Clear
        </Button>
        <Button
          onPress={() => {
            signatureRef.current && signatureRef.current.saveImage();
          }}
          disabled={!userHasSigned}
        >
          Confirm
        </Button>
      </ButtonsContainer>
    </Container>
  );
};

export default SignatureScreen;
