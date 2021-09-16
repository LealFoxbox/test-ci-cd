import { isTablet } from 'react-native-device-info';
import { Dimensions } from 'react-native';

export const getViewportDimensions = (): { width: number; height: number } => {
  let { width, height } = Dimensions.get('window');

  if (width === 0 && height === 0) {
    const dimensions = Dimensions.get('screen');
    width = dimensions.width;
    height = dimensions.height;
  }

  return { width: Math.ceil(width), height: Math.ceil(height) };
};

const { height } = getViewportDimensions();

const IS_SMALL_DEVICE = height < 570;

const getAreaTouch = () => {
  if (IS_SMALL_DEVICE) {
    return {
      width: 50,
      padding: 6,
    };
  } else if (isTablet()) {
    return {
      width: 50,
      padding: 9,
    };
  } else {
    return {
      width: 50,
      padding: 7,
    };
  }
};

const { width: widthAreaTouch, padding: paddingVerticalAreaTouch } = getAreaTouch();

export { widthAreaTouch, paddingVerticalAreaTouch };
