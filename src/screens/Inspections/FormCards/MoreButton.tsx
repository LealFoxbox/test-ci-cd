import React, { useCallback, useRef, useState } from 'react';
import { Menu, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { downloadDir } from 'src/services/storage';
import { paddingVerticalAreaTouch, widthAreaTouch } from 'src/utils/responsive';
import { styled } from 'src/paperTheme';
import LoadingOverlay from 'src/components/LoadingOverlay';
import { ImageHandled, handleCamera, handleGallery } from 'src/services/imageHandler/imagePicker';
import { errorMessages } from 'src/utils/errorMessages';

import { onTakePhotoType } from './createRenderCard';

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

export interface MoreButtonProps {
  onAddComment?: () => void;
  onTakePhoto: onTakePhotoType;
  onDelete: () => void;
  showCommentOption: boolean;
  allowPhotos: boolean;
  allowDelete: boolean;
  photoCallBack: React.Dispatch<React.SetStateAction<boolean>>;
  onTakeCamera: (callback: () => void) => void;
}

export async function fileUrlCopy(uri: string, fileName: string) {
  const destPath = `${downloadDir}/${fileName}`;
  await RNFS.copyFile(uri, destPath);
  const statResult = await RNFS.stat(destPath);
  return statResult.path;
}

const MoreButton: React.FC<MoreButtonProps> = ({
  onAddComment,
  onTakePhoto,
  onDelete,
  photoCallBack,
  showCommentOption,
  allowPhotos,
  allowDelete,
}) => {
  const [visible, setVisible] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const enableButton = useRef<boolean>(true);

  const theme = useTheme();

  const openMenu = useCallback(() => setVisible(true), [setVisible]);

  const closeMenu = useCallback(() => setVisible(false), [setVisible]);

  async function handleImageResult(result: ImageHandled) {
    closeMenu();
    try {
      if (result.error) {
        photoCallBack(false);
        return Alert.alert(result.error);
      }
      if (result.data) {
        await onTakePhoto(result.data, false, photoCallBack);
        photoCallBack(false);
      }
      photoCallBack(false);
      return;
    } catch (error) {
      photoCallBack(false);
      return Alert.alert(errorMessages.generic_problem);
    }
  }

  const handlePhoto = async () => {
    const result = await handleCamera();
    return handleImageResult(result);
  };

  const handleAttach = async () => {
    const result = await handleGallery();
    return handleImageResult(result);
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
