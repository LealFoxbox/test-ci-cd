/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { Image, ImageProps } from 'react-native';

import PlaceholderImage from 'src/assets/placeholder.jpg';

interface ImagePickerImageProps extends Omit<ImageProps, 'source'> {
  uri?: string | null;
}

export default ({ uri, ...props }: ImagePickerImageProps) => {
  if (uri) {
    return <Image {...props} source={{ uri }} defaultSource={PlaceholderImage} />;
  } else {
    return <Image {...props} source={PlaceholderImage} />;
  }
};
