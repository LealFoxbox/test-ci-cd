import React, { useRef, useState } from 'react';
import { Button } from 'react-native-paper';
import SignatureCapture from 'react-native-signature-capture';
import RNFS from 'react-native-fs';
import { directories } from 'react-native-background-downloader';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { styled } from 'src/paperTheme';
import { INSPECTIONS_FORM, SIGNATURE_MODAL } from 'src/navigation/screenNames';
import { MainNavigatorParamList } from 'src/navigation/MainStackNavigator';

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
    params: { formFieldId },
  } = useRoute<RouteProp<MainNavigatorParamList, typeof SIGNATURE_MODAL>>();
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
              navigation.navigate(INSPECTIONS_FORM, { newPhoto: { path, formFieldId } });
            })
            .catch((err) => {
              console.warn('RNFS writefile error: ', JSON.stringify(err));
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
