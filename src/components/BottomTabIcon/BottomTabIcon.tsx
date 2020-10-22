import React from 'react';
import { IconProps } from 'react-native-vector-icons/Icon';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Text } from 'react-native-paper';

import { Container, IconContainer, iconSize } from './styles';

export interface BottomTabIconProps extends IconProps {
  icon: string;
}

const BottomTabIcon: React.FC<BottomTabIconProps> = ({ icon, name, ...props }) => {
  return (
    <Container>
      <IconContainer>
        <MaterialIcons {...props} name={icon} size={iconSize} />
      </IconContainer>
      <Text>{name}</Text>
    </Container>
  );
};

export default BottomTabIcon;
