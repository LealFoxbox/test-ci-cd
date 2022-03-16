import { PermissionsAndroid } from 'react-native';
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { askWriteStoragePermission } from '../storage';

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

const handleImages = (result: ImagePickerResponse) => {
  const fileName = `photo - ${Date.now()}.jpg`;
  if (result.assets && result.assets.length && result.assets?.[0].uri) {
    return { uri: result.assets[0].uri, fileName };
  }
  return false;
};

export async function handleCamera() {
  const hasPermission = await askCameraPermission();
  if (hasPermission) {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.3,
      saveToPhotos: true,
    });
    return handleImages(result);
  }
  return false;
}

export async function handleGallery() {
  const hasPermission = await askWriteStoragePermission();
  if (hasPermission) {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 200, //	To resize the image
      maxHeight: 200, //	To resize the image
      quality: 0.3, //	0 to 1, photos
      includeBase64: false,
    });
    return handleImages(result);
  }
  return false;
}
