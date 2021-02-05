/* eslint-disable react-native/no-color-literals */
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

const HIT_SLOP = { top: 15, left: 15, right: 15, bottom: 15 };

const CloseButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity
    accessibilityRole="button"
    hitSlop={HIT_SLOP}
    style={{
      alignSelf: 'flex-end',
      height: 24,
      width: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(0,0,0,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 25,
      marginRight: 15,
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
      ×
    </Text>
  </TouchableOpacity>
);

export default CloseButton;
