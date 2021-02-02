import React from 'react';
import { directories } from 'react-native-background-downloader';
import RNFS from 'react-native-fs';
import { TextInput } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';

import ImagePickerImage from 'src/components/ImagePickerImage';
import { styled } from 'src/paperTheme';
import { DraftPhoto } from 'src/types';

export async function fileUrlCopy(uri: string, fileName: string) {
  const destPath = `${directories.documents}/${fileName}`;
  await RNFS.copyFile(uri, destPath);
  await RNFS.stat(destPath);
  return destPath;
}

const Container = styled.View`
  margin: 10px;
  padding-top: 10px;
`;

interface NumberCardProps {
  photos: DraftPhoto[];
  commentInputProps: TextInputProps;
}

const NumberCard: React.FC<NumberCardProps> = ({ photos, commentInputProps }) => {
  return (
    <Container>
      <TextInput
        style={{ marginBottom: 10 }}
        keyboardType="numeric"
        autoCapitalize="none"
        dense
        {...commentInputProps}
      />
      {photos.map((draftPhoto) => {
        return <ImagePickerImage uri={draftPhoto.uri} style={{ width: 150, height: 150 }} />;
      })}
    </Container>
  );
};

export default NumberCard;
