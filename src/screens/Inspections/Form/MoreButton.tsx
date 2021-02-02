import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Divider, Menu, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid } from 'react-native';

interface MoreButtonProps {
  onAddComment?: () => void;
  onTakePhoto: (uri: string, isFromGallery: boolean) => void;
  onDelete: () => void;
}

async function askCameraPermission() {
  try {
    const response = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: 'Camera Access Permission',
      message: 'We would like to use your camera',
      buttonPositive: 'Okay',
    });

    console.warn('CAMERA PERM RESPONSE', JSON.stringify(response));

    return response === PermissionsAndroid.RESULTS.GRANTED;
  } catch (e) {
    return false;
  }
}

async function askStoragePermission() {
  try {
    const response = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
      title: 'Storage Access Permission',
      message: 'We would like to access your photos for uploading',
      buttonPositive: 'Okay',
    });

    console.warn('STOAGE PERM RESPONSE', JSON.stringify(response));

    return response === PermissionsAndroid.RESULTS.GRANTED;
  } catch (e) {
    return false;
  }
}

const MoreButton: React.FC<MoreButtonProps> = ({ onAddComment, onTakePhoto, onDelete }) => {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  const handlePhoto = async () => {
    const callback = (response: ImagePickerResponse) => {
      console.warn('photo response', JSON.stringify(response));
      if (response.uri) {
        onTakePhoto(response.uri, false);
      } else {
        console.warn('No uri??');
      }
    };

    const hasPermission = await askCameraPermission();

    if (hasPermission) {
      launchCamera(
        {
          mediaType: 'photo', //	'photo' or 'video'
          maxWidth: 2000, //	To resize the image
          maxHeight: 2000, //	To resize the image
          quality: 0.8, //	0 to 1, photos
          includeBase64: false, //	If true, creates base64 string of the image (Avoid using on large image files due to performance)
          saveToPhotos: true, //	(Boolean) Only for launchCamera, saves the image/video file captured to public photo
        },
        callback,
      );
    }
  };

  const handleAttach = async () => {
    const callback = (response: ImagePickerResponse) => {
      console.warn('photo response', JSON.stringify(response));
      if (response.uri) {
        onTakePhoto(response.uri, true);
      } else {
        console.warn('No uri??');
      }
    };

    const hasPermission = await askStoragePermission();

    if (hasPermission) {
      launchImageLibrary(
        {
          mediaType: 'photo', //	'photo' or 'video'
          maxWidth: 2000, //	To resize the image
          maxHeight: 2000, //	To resize the image
          quality: 0.8, //	0 to 1, photos
          includeBase64: false,
        },
        callback,
      );
    }
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <TouchableOpacity onPress={openMenu} accessibilityRole="button">
          <MaterialCommunityIcons color={theme.colors.primary} name="dots-horizontal-circle" size={28} />
        </TouchableOpacity>
      }
    >
      {!!onAddComment && <Menu.Item onPress={onAddComment} title="Add Comment" />}
      <Menu.Item onPress={handlePhoto} title="Take Photo" />
      <Menu.Item onPress={handleAttach} title="Attach Gallery Photo" />
      <Divider />
      <Menu.Item onPress={onDelete} title="Mark as N/A" />
    </Menu>
  );
};

export default MoreButton;
