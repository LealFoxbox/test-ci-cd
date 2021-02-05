/* eslint-disable react-native/no-color-literals */
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

const HIT_SLOP = { top: 15, left: 15, right: 15, bottom: 15 };

const NextButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity
    accessibilityRole="button"
    hitSlop={HIT_SLOP}
    style={{
      position: 'absolute',
      zIndex: 100,
      right: 10,
      top: '50%',
      height: 32,
      width: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0,0,0,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    }}
    onPress={onPress}
  >
    <Text
      style={{
        backgroundColor: 'transparent',
        fontSize: 25,
        lineHeight: 25,
        color: '#FFF',
        textAlign: 'center',
      }}
    >
      ›
    </Text>
  </TouchableOpacity>
);

export default NextButton;
