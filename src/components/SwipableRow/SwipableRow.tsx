import React from 'react';
import { Animated, Dimensions, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Button, useTheme } from 'react-native-paper';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface SwipableRowProps {
  onPressLeft: () => void;
  leftLabel: string;
}

const SwipableRow: React.FC<SwipableRowProps> = ({ onPressLeft, leftLabel, children }) => {
  const theme = useTheme();

  const leftSwipe = (_progress: Animated.AnimatedInterpolation, _dragX: Animated.AnimatedInterpolation) => {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Button mode="contained" dark onPress={onPressLeft} color={theme.colors.error}>
          {leftLabel}
        </Button>
      </View>
    );
  };
  return (
    <Swipeable renderLeftActions={leftSwipe}>
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
