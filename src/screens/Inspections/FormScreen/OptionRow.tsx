import React from 'react';
import { Paragraph } from 'react-native-paper';
import { Switch } from 'react-native-gesture-handler';

import { styled } from 'src/paperTheme';

const Container = styled.View`
  background-color: white;
  padding: 10px;
  flex-direction: row;
  align-items: center;
  width: 100%;
`;

interface OptionRowProps {
  label: string;
  value?: boolean;
  icon: React.ReactNode;
  onToggle?: () => void;
  disabled?: boolean;
}

const OptionRow: React.FC<OptionRowProps> = ({ label, icon, disabled, value, onToggle }) => {
  return (
    <Container>
      {icon}
      <Paragraph style={{ flex: 1, marginHorizontal: 10 }}>{label}</Paragraph>
      {value !== undefined && onToggle && <Switch disabled={disabled} value={value} onValueChange={onToggle} />}
    </Container>
  );
};

export default OptionRow;
