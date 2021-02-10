import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Divider, Menu, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid } from 'react-native';
import { directories } from 'react-native-background-downloader';
import RNFS from 'react-native-fs';

type onTakePhotoType = (uri: string, isFromGallery: boolean) => void;

export interface MoreButtonProps {
  onAddComment?: () => void;
  onTakePhoto?: onTakePhotoType;
  onDelete: () => void;
  showCommentOption: boolean;
  allowPhotos: boolean;
}

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

function createAddHandler(onTakePhoto: onTakePhotoType | undefined, closeMenu: () => void, isAttachment: boolean) {
  return async () => {
    const callback = async (response: ImagePickerResponse) => {
      if (!response.didCancel && !response.errorCode) {
        if (response.uri) {
          const newUri = await fileUrlCopy(response.uri, `photo - ${Date.now()}.jpg`);
          onTakePhoto && onTakePhoto(newUri, isAttachment);
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

    closeMenu();
  };
}

const MoreButton: React.FC<MoreButtonProps> = ({
  onAddComment,
  onTakePhoto,
  onDelete,
  showCommentOption,
  allowPhotos,
}) => {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  const handlePhoto = createAddHandler(onTakePhoto, closeMenu, false);

  const handleAttach = createAddHandler(onTakePhoto, closeMenu, true);

  const handleDelete = () => {
    closeMenu();
    onDelete();
  };

  const handleAddComment = () => {
    closeMenu();
    onAddComment && onAddComment();
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
      {allowPhotos && (
        <>
          <Menu.Item icon="camera-outline" onPress={handlePhoto} title="Take Photo" />
          <Divider />
          <Menu.Item icon="image-multiple-outline" onPress={handleAttach} title="Choose Photo" />
          <Divider />
        </>
      )}
      {showCommentOption && (
        <>
          <Menu.Item icon="message-outline" onPress={handleAddComment} title="Add Comment" />
          <Divider />
        </>
      )}
      <Menu.Item
        icon={() => <MaterialCommunityIcons color={theme.colors.deficient} name="delete-outline" size={24} />}
        onPress={handleDelete}
        title="Not Applicable"
        titleStyle={{ color: theme.colors.deficient }}
      />
    </Menu>
  );
};

export default MoreButton;
