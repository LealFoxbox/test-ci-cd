import React, { JSXElementConstructor, ReactElement } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Button, useTheme } from 'react-native-paper';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface SwipableRowProps {
  onPressRight: () => void;
  rightLabel: ReactElement<any, string | JSXElementConstructor<any>> | string;
}

const SwipableRow: React.FC<SwipableRowProps> = ({ rightLabel, children, onPressRight }) => {
  const theme = useTheme();

  const rightSwipe = (_progress: Animated.AnimatedInterpolation, _dragX: Animated.AnimatedInterpolation) => {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 2,
          marginLeft: 4,
        }}
      >
        <Button
          style={{
            borderBottomEndRadius: 8,
            borderTopEndRadius: 8,
          }}
          contentStyle={{
            paddingHorizontal: 10,
            flex: 1,
          }}
          mode="contained"
          dark
          onPress={onPressRight}
          color={theme.colors.error}
        >
          {rightLabel}
        </Button>
      </View>
    );
  };
  return (
    <Swipeable renderRightActions={rightSwipe}>
      <View
        style={{
          width: SCREEN_WIDTH,
          backgroundColor: theme.colors.surface,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </View>
    </Swipeable>
  );
};

export default SwipableRow;
