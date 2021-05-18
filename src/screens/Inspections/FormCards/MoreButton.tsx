import React, { useCallback, useRef, useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Menu, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';

import { askWriteStoragePermission, downloadDir } from 'src/services/storage';

type onTakePhotoType = (params: { uri: string; fileName: string }, isFromGallery: boolean) => Promise<void>;

export interface MoreButtonProps {
  onAddComment?: () => void;
  onTakePhoto?: onTakePhotoType;
  onDelete: () => void;
  showCommentOption: boolean;
  allowPhotos: boolean;
  allowDelete: boolean;
}

export async function fileUrlCopy(uri: string, fileName: string) {
  const destPath = `${downloadDir}/${fileName}`;
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

async function createAddHandler(
  onTakePhoto: onTakePhotoType | undefined,
  closeMenu: () => void,
  enableButton: boolean,
  enableButtonHandler: (val: boolean) => void,
  isAttachment: boolean,
) {
  // flag to stop it being called again until the menu is dismissed
  if (!enableButton) return;
  enableButtonHandler(false);

  const callback = async (response: ImagePickerResponse) => {
    try {
      if (!response.didCancel && !response.errorCode) {
        if (response.uri) {
          const fileName = `photo - ${Date.now()}.jpg`;
          const newUri = await fileUrlCopy(response.uri, fileName);
          if (onTakePhoto) {
            await onTakePhoto({ uri: newUri, fileName }, isAttachment);
          }
        } else {
          console.warn('MoreButton createAddHandler: ImagePickerResponse uri is undefined');
        }
      }
    } catch (error) {
      console.warn('[APP] createAddHandler callback', error.message);
    }
    enableButtonHandler(true);
  };

  try {
    if (isAttachment) {
      const hasPermission = await askWriteStoragePermission();

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
      } else {
        enableButtonHandler(true);
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
      } else {
        enableButtonHandler(true);
      }
    }
  } catch (error) {
    console.warn('[APP] createAddHandler', error.message);
    enableButtonHandler(true);
  }
  closeMenu();
}

const MoreButton: React.FC<MoreButtonProps> = ({
  onAddComment,
  onTakePhoto,
  onDelete,
  showCommentOption,
  allowPhotos,
  allowDelete,
}) => {
  const [visible, setVisible] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const enableButton = useRef<boolean>(true);

  const theme = useTheme();

  const enableButtonHandler = (toggleValue: boolean) => (enableButton.current = toggleValue);

  const openMenu = useCallback(() => setVisible(true), [setVisible]);

  const closeMenu = useCallback(() => setVisible(false), [setVisible]);

  const handlePhoto = () => createAddHandler(onTakePhoto, closeMenu, enableButton.current, enableButtonHandler, false);

  const handleAttach = () => createAddHandler(onTakePhoto, closeMenu, enableButton.current, enableButtonHandler, true);

  const handleDelete = () => {
    closeMenu();
    onDelete();
  };

  const handleAddComment = () => {
    closeMenu();
    onAddComment && onAddComment();
  };

  const handleOpenDelete = () => setDeleteMode(true);
  const handleCloseDelete = () => setDeleteMode(false);

  if (!allowPhotos && !showCommentOption && !allowDelete) {
    return null;
  }

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
      {!deleteMode && allowPhotos && (
        <>
          <Menu.Item icon="camera-outline" onPress={handlePhoto} title="Take Photo" />
          <Menu.Item icon="image-multiple-outline" onPress={handleAttach} title="Choose Photo" />
        </>
      )}
      {!deleteMode && showCommentOption && (
        <Menu.Item icon="message-outline" onPress={handleAddComment} title="Add Comment" />
      )}
      {!deleteMode && allowDelete && (
        <Menu.Item
          icon={() => <MaterialCommunityIcons color={theme.colors.deficient} name="delete-outline" size={24} />}
          onPress={handleOpenDelete}
          title="Not Applicable"
          titleStyle={{ color: theme.colors.deficient }}
        />
      )}
      {deleteMode && (
        <>
          <Menu.Item
            icon={() => <MaterialCommunityIcons color={theme.colors.deficient} name="delete-outline" size={24} />}
            onPress={handleDelete}
            title="Delete"
            titleStyle={{ color: theme.colors.deficient }}
          />
          <Menu.Item icon="close" onPress={handleCloseDelete} title="Cancel" />
        </>
      )}
    </Menu>
  );
};

export default MoreButton;
