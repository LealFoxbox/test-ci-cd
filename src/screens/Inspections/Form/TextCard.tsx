import React from 'react';
import { Card, TextInput } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';

import ErrorMessage from 'src/components/ErrorMessage';
import { styled } from 'src/paperTheme';
import { FormItem } from 'src/types';

const Container = styled.View`
  background-color: white;
  padding: 10px;
`;

interface RowProps {
  formItem: FormItem;
  inputProps: TextInputProps;
  touched?: boolean;
  errors?: string;
}

const Row: React.FC<RowProps> = ({ formItem, inputProps, touched, errors }) => {
  return (
    <Container>
      <Card>
        <Card.Title title={formItem.display_name} subtitle={formItem.description} />
        <Card.Content style={{ flex: 1 }}>
          <TextInput style={{ marginBottom: 10 }} keyboardType="default" autoCapitalize="none" dense {...inputProps} />
          {touched && errors && <ErrorMessage>{errors}</ErrorMessage>}
        </Card.Content>
      </Card>
    </Container>
  );
};
export default Row;
