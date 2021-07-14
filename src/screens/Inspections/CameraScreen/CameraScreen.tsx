import React, { useCallback, useEffect } from 'react';
import { CameraScreen } from 'react-native-camera-kit';
import { BackHandler, ImageSourcePropType } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import FlashOnImage from 'src/assets/camera/flashOn.png';
import FlashOffImage from 'src/assets/camera/flashOff.png';
import FlashAutoImage from 'src/assets/camera/flashAuto.png';
import FlipImage from 'src/assets/camera/cameraFlipIcon.png';
import CameraButton from 'src/assets/camera/cameraButton.png';
import TorchOnImage from 'src/assets/camera/torchOn.png';
import TorchOffImage from 'src/assets/camera/torchOff.png';

import { MainNavigatorParamList } from 'src/navigation/MainStackNavigator';
import { CAMERA_MODAL, INSPECTIONS_FORM } from 'src/navigation/screenNames';
import { styled } from 'src/paperTheme';
import { InspectionFormParams } from 'src/navigation/InspectionsNavigator';

type FlashImagesType = {
  on: ImageSourcePropType;
  off: ImageSourcePropType;
  auto: ImageSourcePropType;
};

const flashImages: FlashImagesType = {
  on: FlashOnImage as ImageSourcePropType,
  off: FlashOffImage as ImageSourcePropType,
  auto: FlashAutoImage as ImageSourcePropType,
};

const Container = styled.View`
  flex: 1;
  width: 100%;
`;

type EventButtonPress = {
  type: 'left' | 'capture';
  captureImages: {
    path: string;
    height: number;
    name: string;
    width: number;
    id: string;
    uri: string;
  }[];
};

const Camera: React.FC = () => {
  const navigation = useNavigation();
  const {
    params: { screenName, formFieldId, callback },
  } = useRoute<RouteProp<MainNavigatorParamList, typeof CAMERA_MODAL>>();
  const onBottomButtonPressed = (event: EventButtonPress) => {
    callback && callback();
    if (event.type === 'capture') {
      const capture = event.captureImages?.[0];
      if (capture && capture?.uri) {
        const fileName = `photo - ${Date.now()}.jpg`;
        const newPhoto: InspectionFormParams['newPhoto'] = { path: capture.uri, fileName, formFieldId };
        navigation.navigate(screenName || INSPECTIONS_FORM, { newPhoto });
      } else {
        navigation.navigate(screenName || INSPECTIONS_FORM);
      }
    } else {
      navigation.navigate(screenName || INSPECTIONS_FORM);
    }
  };

  const handleBackPress = useCallback(() => {
    callback && callback();
    return false;
  }, [callback]);

  useEffect(() => {
    const hardwareBackPressListener = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => hardwareBackPressListener.remove();
  }, [handleBackPress]);

  return (
    <Container>
      <CameraScreen
        onBottomButtonPressed={onBottomButtonPressed}
        cameraFlipImage={FlipImage as ImageSourcePropType}
        captureButtonImage={CameraButton as ImageSourcePropType}
        torchOnImage={TorchOnImage as ImageSourcePropType}
        torchOffImage={TorchOffImage as ImageSourcePropType}
        showCapturedImageCount
        // TODO doesn't have props defined
        // @ts-ignore
        actions={{ rightButtonText: 'Done', leftButtonText: 'Cancel' }}
        flashImages={flashImages}
      />
    </Container>
  );
};

export default Camera;
