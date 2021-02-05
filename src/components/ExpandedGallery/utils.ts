import { GestureResponderEvent, Image, PanResponder, PanResponderGestureState } from 'react-native';

import { DimensionsType, ImageType, ScreenDimensionsType, TouchType, TransitionType, TranslateType } from './types';

const SCALE_EPSILON = 0.01;
const SCALE_MULTIPLIER = 1.2;

export const generatePanHandlers = (
  onStart: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => void,
  onMove: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => void,
  onRelease: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => void,
) =>
  PanResponder.create({
    onStartShouldSetPanResponder: (): boolean => true,
    onStartShouldSetPanResponderCapture: (): boolean => true,
    onMoveShouldSetPanResponder: (): boolean => true,
    onMoveShouldSetPanResponderCapture: (): boolean => true,
    onPanResponderGrant: onStart,
    onPanResponderMove: onMove,
    onPanResponderRelease: onRelease,
    onPanResponderTerminate: onRelease,
    onPanResponderTerminationRequest: () => true, // TODO: check because this was void before
    onShouldBlockNativeResponder: () => false,
  });

export const getScale = (currentDistance: number, initialDistance: number): number =>
  (currentDistance / initialDistance) * SCALE_MULTIPLIER;

export const getDistance = (touches: Array<TouchType>): number => {
  const [a, b] = touches;

  if (a == null || b == null) {
    return 0;
  }

  return Math.sqrt(Math.pow(a.pageX - b.pageX, 2) + Math.pow(a.pageY - b.pageY, 2));
};

export const calculateInitialScale = (
  imageWidth = 0,
  imageHeight = 0,
  { screenWidth, screenHeight }: ScreenDimensionsType,
) => {
  const screenRatio = screenHeight / screenWidth;
  const imageRatio = imageHeight / imageWidth;

  if (imageWidth > screenWidth || imageHeight > screenHeight) {
    if (screenRatio > imageRatio) {
      return screenWidth / imageWidth;
    }

    return screenHeight / imageHeight;
  }

  return 1;
};

export const calculateInitialTranslate = (
  imageWidth = 0,
  imageHeight = 0,
  { screenWidth, screenHeight }: ScreenDimensionsType,
): TranslateType => {
  const getTranslate = (axis: string) => {
    const imageSize = axis === 'x' ? imageWidth : imageHeight;
    const screenSize = axis === 'x' ? screenWidth : screenHeight;

    if (imageWidth >= imageHeight) {
      return (screenSize - imageSize) / 2;
    }

    return screenSize / 2 - imageSize / 2;
  };

  return {
    x: getTranslate('x'),
    y: getTranslate('y'),
  };
};

export const getInitialParams = (
  { width, height }: ImageType,
  screenDimensions: ScreenDimensionsType,
): TransitionType => ({
  scale: calculateInitialScale(width, height, screenDimensions),
  translate: calculateInitialTranslate(width, height, screenDimensions),
});

export function fetchImageSize(
  images: Array<ImageType> = [],
): Array<Promise<{ width: number; height: number; index: number }>> {
  return images.reduce((acc, image) => {
    if (image.source && image.source.uri && (!image.width || !image.height)) {
      const imageSize = new Promise<{ width: number; height: number; index: number }>((resolve, reject) => {
        Image.getSize(
          image.source.uri || '',
          (width, height) =>
            resolve({
              width,
              height,
              index: image.index,
            }),
          reject,
        );
      });

      acc.push(imageSize);
    }

    return acc;
  }, []);
}

const shortHexRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
const fullHexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

export const isHex = (color: string): boolean => fullHexRegex.test(color) || shortHexRegex.test(color);

export const hexToRgb = (hex: string): number[] => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const input = hex.replace(shortHexRegex, (m, r, g, b) => `${r}${r}${g}${g}${b}${b}`);

  const [match, r, g, b] = [].concat(fullHexRegex.exec(input));

  if (!match) {
    return [];
  }

  return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
};

export const addIndexesToImages = (images: ImageType[]): ImageType[] =>
  images.map((image, index) => ({ ...image, index }));

export const getImagesWithoutSize = (images: ImageType[]) => images.filter(({ width, height }) => !width || !height);

export const scalesAreEqual = (scaleA: number, scaleB: number): boolean => Math.abs(scaleA - scaleB) < SCALE_EPSILON;
