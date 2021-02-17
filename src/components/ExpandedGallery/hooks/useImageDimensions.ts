/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState } from 'react';
import { Image, ImageURISource } from 'react-native';

import { createCache } from '../utils';
import { Dimensions, ImageSource } from '../types';

const CACHE_SIZE = 50;
const imageDimensionsCache = createCache<Dimensions>(CACHE_SIZE);

const getSizeWithHeaders = (image: ImageURISource) => {
  return new Promise<{ width: number; height: number }>((resolve) => {
    Image.getSizeWithHeaders(
      image.uri || '',
      image.headers || {},
      (width: number, height: number) => {
        imageDimensionsCache.set(image.uri || '', { width, height });
        resolve({ width, height });
      },
      () => {
        resolve({ width: 0, height: 0 });
      },
    );
  });
};

const getImageDimensions = async (image: ImageSource) => {
  if (typeof image === 'number') {
    const cacheKey = `${image}`;
    const imageDimensions = imageDimensionsCache.get(cacheKey);

    if (imageDimensions) {
      return imageDimensions;
    } else {
      const { width, height } = Image.resolveAssetSource(image);
      imageDimensionsCache.set(cacheKey, { width, height });
      return { width, height };
    }
  } else if (image.uri) {
    const cacheKey = image.uri;

    const imageDimensions = imageDimensionsCache.get(cacheKey);

    if (imageDimensions) {
      return imageDimensions;
    } else {
      return await getSizeWithHeaders(image);
    }
  } else {
    return { width: 0, height: 0 };
  }
};

const useImageDimensions = (imageSource: ImageSource): Dimensions | null => {
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  useEffect(() => {
    let isImageUnmounted = false;

    void getImageDimensions(imageSource).then((d) => {
      if (!isImageUnmounted) {
        setDimensions(d);
      }
    });

    return () => {
      isImageUnmounted = true;
    };
  }, [imageSource]);

  return dimensions;
};

export default useImageDimensions;
