import { Linking } from 'react-native';

export const openURL = (url: string) => {
  if (!url) {
    return;
  }

  try {
    void Linking.openURL(url);
  } catch (err) {
    console.error('openURL error: ', err);
  }
};
