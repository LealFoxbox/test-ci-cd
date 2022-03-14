import { PermissionsAndroid } from 'react-native';
import { launchCamera } from 'react-native-image-picker';

async function askCameraPermission() {
  try {
    const response = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: 'Camera Access Permission',
      message: 'We would like to use your camera',
      buttonPositive: 'Okay',
    });

    return response === PermissionsAndroid.RESULTS.GRANTED;
  } catch (e) {
    return false;
  }
}

// const onBottomButtonPressed = (event: EventButtonPress) => {
//   // callback && callback();
//   let capture = null;

//   if (event.assets && event.assets.length) {
//     capture = event.assets?.[0];
//   } else {
//     capture = event;
//   }

//   if (event.didCancel || event.errorCode || !capture || !capture?.uri) {
//     // navigation.navigate(screenName || INSPECTIONS_FORM);
//     return;
//   }

//   const fileName = `photo - ${Date.now()}.jpg`;
//   // const newPhoto: InspectionFormParams['newPhoto'] = ;
//   // navigation.navigate(screenName || INSPECTIONS_FORM, { newPhoto });
// };

export async function handleImagePicker() {
  if (await askCameraPermission()) {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.3,
      saveToPhotos: true,
    });

    const fileName = `photo - ${Date.now()}.jpg`;
    if (result.assets && result.assets.length && result.assets?.[0].uri) {
      return { uri: result.assets[0].uri, fileName };
    }
  }

  return false;
  //   ,
  //   (response) => {
  //     console.log({ response });
  //
  //     // onBottomButtonPressed(response);
  //   },
  // );
}
