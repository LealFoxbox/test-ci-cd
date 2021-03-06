import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { Button } from 'react-native-paper';
import SignatureCapture from 'react-native-signature-capture';
import RNFS from 'react-native-fs';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { styled } from 'src/paperTheme';
import { INSPECTIONS_FORM, SIGNATURE_MODAL } from 'src/navigation/screenNames';
import { MainNavigatorParamList } from 'src/navigation/MainStackNavigator';
import { InspectionFormParams } from 'src/navigation/InspectionsNavigator';
import { downloadDir } from 'src/services/storage';

const Container = styled.View`
  flex: 1;
  width: 100%;
`;

const ButtonsContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 20px;
`;

const dir = downloadDir;

const SignatureScreen: React.FC = () => {
  const signatureRef = useRef<SignatureCapture>(null);
  const [userHasSigned, setUserHasSigned] = useState(false);
  const dim = Dimensions.get('window');

  const [isPortrait, setIsPortrait] = useState(dim.height > dim.width);
  const {
    params: { formFieldId, screenName },
  } = useRoute<RouteProp<MainNavigatorParamList, typeof SIGNATURE_MODAL>>();
  const navigation = useNavigation();

  useEffect(() => {
    const onChangeDimension = ({ window }: { window: ScaledSize }) => {
      setIsPortrait(window.height > window.width);
    };

    Dimensions.addEventListener('change', onChangeDimension);

    return () => {
      Dimensions.removeEventListener('change', onChangeDimension);
    };
  }, []);

  return (
    <Container>
      <SignatureCapture
        style={{ flex: 1, width: '100%' }}
        ref={signatureRef}
        onSaveEvent={({ encoded }) => {
          const fileName = `signature - ${Date.now()}.png`;

          const path = `${dir}/${fileName}`;
          RNFS.writeFile(path, encoded, 'base64')
            .then(() => {
              // since this is navigating back we don't need to fill in every param for InspectionFormParams
              const newSignature: InspectionFormParams['newSignature'] = { path, fileName, formFieldId };

              navigation.navigate(screenName || INSPECTIONS_FORM, { newSignature });
            })
            .catch((err) => {
              console.warn('Signature Screen RNFS writefile error: ', err);
            });
        }}
        onDragEvent={() => {
          setUserHasSigned(true);
        }}
        saveImageFileInExtStorage={false}
        showNativeButtons={false}
        showTitleLabel={false}
        showBorder={false}
        viewMode={isPortrait ? 'portrait' : 'landscape'}
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
          mode="contained"
          dark
          onPress={() => {
            signatureRef.current && signatureRef.current.saveImage();
          }}
          disabled={!userHasSigned}
        >
          Save
        </Button>
      </ButtonsContainer>
    </Container>
  );
};

export default SignatureScreen;
