import React, { useCallback, useRef, useState } from 'react';
import { Menu, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ImagePickerResponse, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';

import { askWriteStoragePermission, downloadDir } from 'src/services/storage';
import { paddingVerticalAreaTouch, widthAreaTouch } from 'src/utils/responsive';
import { styled } from 'src/paperTheme';
import LoadingOverlay from 'src/components/LoadingOverlay';
import { logErrorToSentry } from 'src/utils/logger';
import { handleCamera, handleGallery } from 'src/services/imageHandler/imagePicker';

const Container = styled.View`
  position: relative;
  width: ${widthAreaTouch};
  height: 30px;
`;

const ViewStyled = styled.View`
  top: -30px;
  left: ${-widthAreaTouch + 35};
  position: absolute;
  z-index: 1;
`;

export type onTakePhotoType = (params: { uri: string; fileName: string }, isFromGallery: boolean) => Promise<void>;

type EventButtonPress = ImagePickerResponse & {
  uri: string;
};

export interface MoreButtonProps {
  onAddComment?: () => void;
  onTakePhoto: onTakePhotoType;
  onDelete: () => void;
  showCommentOption: boolean;
  allowPhotos: boolean;
  allowDelete: boolean;
  onTakeCamera: (callback: () => void) => void;
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
  launchCamera?: () => void,
) {
  const startAddHandler = Date.now();
  // flag to stop it being called again until the menu is dismissed
  if (!enableButton) return;
  enableButtonHandler(false);

  const callback = async (response: EventButtonPress) => {
    try {
      logErrorToSentry('[INFO][entering callback]', {
        severity: Sentry.Severity.Info,
        response,
      });
      let capture = null;

      if (response.assets && response.assets.length) {
        capture = response.assets?.[0];
      } else {
        capture = response;
      }
      logErrorToSentry('[INFO][callback response.assets && response.assets.length]', {
        severity: Sentry.Severity.Info,
        timeSpent: Date.now() - startAddHandler,
      });

      if (response.didCancel || response.errorCode || !capture || !capture?.uri) {
        console.warn('MoreButton createAddHandler: ImagePickerResponse uri is undefined');
        return;
      }
      logErrorToSentry('[INFO][ callback response.didCancel || response.errorCode || !capture || !capture?.uri]', {
        severity: Sentry.Severity.Info,
        timeSpent: Date.now() - startAddHandler,
      });

      const cbDate = Date.now();
      const fileName = `photo - ${cbDate}.jpg`;
      const newUri = await fileUrlCopy(capture.uri, fileName);
      if (onTakePhoto) {
        await onTakePhoto({ uri: newUri, fileName }, isAttachment);
      }
      logErrorToSentry('[INFO][callback worked]', {
        severity: Sentry.Severity.Info,
        timeSpent: cbDate - startAddHandler,
      });
    } catch (error) {
      logErrorToSentry('[ERROR][createAddHandler callback]', {
        severity: Sentry.Severity.Error,
        infoMessage: error?.message,
      });
    }
    enableButtonHandler(true);
  };

  try {
    const checkGalleryOrCamera = Date.now();
    if (isAttachment) {
      const hasPermission = await askWriteStoragePermission();
      if (hasPermission) {
        logErrorToSentry('[INFO][storage process started]', {
          severity: Sentry.Severity.Info,
          timeSpent: checkGalleryOrCamera - startAddHandler,
        });
        void launchImageLibrary(
          {
            mediaType: 'photo',
            maxWidth: 200, //	To resize the image
            maxHeight: 200, //	To resize the image
            quality: 0.3, //	0 to 1, photos
            includeBase64: false,
          },
          (response) => {
            void callback(response as EventButtonPress);
          },
        );
        logErrorToSentry('[INFO][camera process finished]', {
          severity: Sentry.Severity.Info,
          totalTimeSpent: Date.now() - startAddHandler,
          timeSpent: Date.now() - checkGalleryOrCamera,
        });
      } else {
        enableButtonHandler(true);
      }
    } else {
      const hasPermission = await askCameraPermission();

      logErrorToSentry('[INFO][camera process started]', {
        severity: Sentry.Severity.Info,
        timeSpent: checkGalleryOrCamera - startAddHandler,
      });

      if (hasPermission && launchCamera) {
        closeMenu();
        launchCamera();
        logErrorToSentry('[INFO][launch camera]', {
          severity: Sentry.Severity.Info,
          totalTimeSpent: Date.now() - startAddHandler,
          timeSpentWithLaunchCamera: Date.now() - checkGalleryOrCamera,
        });
      } else {
        enableButtonHandler(true);
      }
      logErrorToSentry('[INFO][camera process finished] ', {
        severity: Sentry.Severity.Info,
        totalTimeSpent: Date.now() - startAddHandler,
      });
    }
  } catch (error) {
    logErrorToSentry('[ERROR][createAddHandler]', {
      severity: Sentry.Severity.Error,
      infoMessage: error?.message,
    });
    enableButtonHandler(true);
  }
  const endAddHandler = Date.now();
  logErrorToSentry('[INFO][end of method createAddHandler]', {
    severity: Sentry.Severity.Info,
    timeSpent: endAddHandler - startAddHandler,
  });
  closeMenu();
}

const MoreButton: React.FC<MoreButtonProps> = ({
  onAddComment,
  onTakePhoto,
  onDelete,
  showCommentOption,
  allowPhotos,
  allowDelete,
  // onTakeCamera,
}) => {
  const [visible, setVisible] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const enableButton = useRef<boolean>(true);

  const theme = useTheme();

  const enableButtonHandler = (toggleValue: boolean) => (enableButton.current = toggleValue);

  const openMenu = useCallback(() => setVisible(true), [setVisible]);

  const closeMenu = useCallback(() => setVisible(false), [setVisible]);

  // const launchCamera = useCallback(() => {
  //   onTakeCamera(() => enableButtonHandler(true));
  // }, [onTakeCamera]);

  // const handlePhoto = () =>
  //   createAddHandler(onTakePhoto, closeMenu, enableButton.current, enableButtonHandler, false, launchCamera);

  const handlePhoto = async () => {
    const photo = await handleCamera();
    closeMenu();
    if (photo) void onTakePhoto(photo, false);
    return;
  };

  // const handleAttach = () => createAddHandler(onTakePhoto, closeMenu, enableButton.current, enableButtonHandler, true);

  const handleAttach = async () => {
    const attach = await handleGallery();
    closeMenu();
    if (attach) void onTakePhoto(attach, false);
    return;
  };

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
  //LoadingOverlay
  return (
    <>
      {!enableButton && <LoadingOverlay />}
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        style={{ marginLeft: -20, marginTop: paddingVerticalAreaTouch + 8 }}
        anchor={
          <Container>
            <ViewStyled>
              <TouchableOpacity
                style={{
                  width: widthAreaTouch + 25,
                  alignItems: 'flex-end',
                  height: 90,
                }}
                onPress={openMenu}
                accessibilityRole="button"
                hitSlop={{ top: 1000, right: 1000, bottom: 1000, left: 1000 }}
              >
                <MaterialCommunityIcons
                  style={{ paddingRight: 20, paddingTop: 30 }}
                  color={theme.colors.primary}
                  name="dots-horizontal-circle"
                  size={30}
                />
              </TouchableOpacity>
            </ViewStyled>
          </Container>
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
    </>
  );
};

export default MoreButton;
