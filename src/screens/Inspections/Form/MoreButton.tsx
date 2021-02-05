import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Divider, Menu, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid } from 'react-native';
import { directories } from 'react-native-background-downloader';
import RNFS from 'react-native-fs';

type onTakePhotoType = (uri: string, isFromGallery: boolean) => void;

interface MoreButtonProps {
  onAddComment?: () => void;
  onTakePhoto: onTakePhotoType;
  onDelete: () => void;
}

// TODO: erase old picture
export async function fileUrlCopy(uri: string, fileName: string) {
  const destPath = `${directories.documents}/${fileName}`;
  await RNFS.copyFile(uri, destPath);
  const statResult = await RNFS.stat(destPath);
  return statResult.path;
}

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

async function askStoragePermission() {
  try {
    const response = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
      title: 'Storage Access Permission',
      message: 'We would like to access your photos for uploading',
      buttonPositive: 'Okay',
    });

    return response === PermissionsAndroid.RESULTS.GRANTED;
  } catch (e) {
    return false;
  }
}

function createAddHandler(onTakePhoto: onTakePhotoType, isAttachment: boolean) {
  return async () => {
    const callback = async (response: ImagePickerResponse) => {
      console.warn('photo response', JSON.stringify(response));
      if (!response.didCancel && !response.errorCode) {
        if (response.uri) {
          const newUri = await fileUrlCopy(response.uri, response.fileName || `${Date.now()}.jpg`);
          onTakePhoto(newUri, isAttachment);
        } else {
          console.warn('No uri??');
        }
      }
    };

    if (isAttachment) {
      const hasPermission = await askStoragePermission();

      if (hasPermission) {
        launchImageLibrary(
          {
            mediaType: 'photo',
            maxWidth: 2000, //	To resize the image
            maxHeight: 2000, //	To resize the image
            quality: 0.8, //	0 to 1, photos
            includeBase64: false,
          },
          callback,
        );
      }
    } else {
      const hasPermission = await askCameraPermission();

      if (hasPermission) {
        launchCamera(
          {
            mediaType: 'photo',
            maxWidth: 2000, //	To resize the image
            maxHeight: 2000, //	To resize the image
            quality: 0.8, //	0 to 1, photos
            includeBase64: false,
            saveToPhotos: false, //	saves the image/video file captured to public photo
          },
          callback,
        );
      }
    }
  };
}

const MoreButton: React.FC<MoreButtonProps> = ({ onAddComment, onTakePhoto, onDelete }) => {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  const handlePhoto = createAddHandler(onTakePhoto, false);

  const handleAttach = createAddHandler(onTakePhoto, true);

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
