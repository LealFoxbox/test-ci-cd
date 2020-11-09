import React, { ReactNode } from 'react';
import { Platform } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAwareScrollViewProps } from 'react-native-keyboard-aware-scroll-view';

const isIOS = Platform.OS === 'ios';

interface ScrollViewProps extends KeyboardAwareScrollViewProps {
  children: ReactNode;
  ref: any;
}

type Ref =
  | ((instance: KeyboardAwareScrollView | null) => void)
  | React.MutableRefObject<KeyboardAwareScrollView | null>
  | null;

export const ScrollView = React.forwardRef(({ children, style, ...props }: ScrollViewProps, ref: Ref) => (
  <KeyboardAwareScrollView
    style={[{ flex: 1, width: '100%' }, style]}
    enableOnAndroid
    extraScrollHeight={30}
    keyboardShouldPersistTaps="handled"
    enableAutomaticScroll={isIOS}
    {...props}
    ref={ref}
  >
    {children}
  </KeyboardAwareScrollView>
));
