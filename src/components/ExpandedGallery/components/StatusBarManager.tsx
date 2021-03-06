import { useEffect } from 'react';
import { ModalProps, Platform, StatusBar } from 'react-native';

const StatusBarManager = ({ presentationStyle }: { presentationStyle?: ModalProps['presentationStyle'] }) => {
  if (Platform.OS !== 'ios' && presentationStyle === 'overFullScreen') {
    //Can't get an actual state of app status bar with default RN. Gonna rely on "presentationStyle === overFullScreen" prop and guess application status bar state to be visible in this case.
    StatusBar.setHidden(true);
  }

  useEffect(() => {
    return () => {
      if (Platform.OS !== 'ios' && presentationStyle === 'overFullScreen') {
        StatusBar.setHidden(false);
      }
    };
  }, [presentationStyle]);

  return null;
};

export default StatusBarManager;
