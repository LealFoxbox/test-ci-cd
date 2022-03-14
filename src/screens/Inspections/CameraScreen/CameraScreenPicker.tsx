import React, { useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ImagePickerResponse, launchCamera } from 'react-native-image-picker';
import Orientation from 'react-native-orientation-locker';

import { MainNavigatorParamList } from 'src/navigation/MainStackNavigator';
import { CAMERA_MODAL, INSPECTIONS_FORM } from 'src/navigation/screenNames';
import { InspectionFormParams } from 'src/navigation/InspectionsNavigator';

type EventButtonPress = ImagePickerResponse & {
  uri: string;
};

const Camera: React.FC = () => {
  const navigation = useNavigation();
  const {
    params: { screenName, formFieldId, callback },
  } = useRoute<RouteProp<MainNavigatorParamList, typeof CAMERA_MODAL>>();

  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  const onBottomButtonPressed = (event: EventButtonPress) => {
    callback && callback();
    let capture = null;

    if (event.assets && event.assets.length) {
      capture = event.assets?.[0];
    } else {
      capture = event;
    }

    if (event.didCancel || event.errorCode || !capture || !capture?.uri) {
      navigation.navigate(screenName || INSPECTIONS_FORM);
      return;
    }

    const fileName = `photo - ${Date.now()}.jpg`;
    const newPhoto: InspectionFormParams['newPhoto'] = { path: capture.uri, fileName, formFieldId };
    navigation.navigate(screenName || INSPECTIONS_FORM, { newPhoto });
  };

  function handleImagePicker() {
    void launchCamera(
      {
        mediaType: 'photo',
        quality: 0.3,
        saveToPhotos: true,
      },
      (response) => {
        onBottomButtonPressed(response as EventButtonPress);
      },
    );
  }

  const handleBackPress = useCallback(() => {
    callback && callback();
    navigation.navigate(screenName || INSPECTIONS_FORM);
    return true;
  }, [callback, navigation, screenName]);

  useEffect(() => {
    const hardwareBackPressListener = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => hardwareBackPressListener.remove();
  }, [handleBackPress]);

  useEffect(() => {
    handleImagePicker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Camera;
