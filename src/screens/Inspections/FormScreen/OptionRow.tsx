import React from 'react';
import { Paragraph, Switch, useTheme } from 'react-native-paper';

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
  const theme = useTheme();
  return (
    <Container>
      {icon}
      <Paragraph style={{ flex: 1, marginHorizontal: 10 }}>{label}</Paragraph>
      {value !== undefined && onToggle && (
        <Switch disabled={disabled} value={value} onValueChange={onToggle} color={theme.colors.success} />
      )}
    </Container>
  );
};

export default OptionRow;
