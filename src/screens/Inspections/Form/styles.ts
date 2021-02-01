import { styled, withTheme } from 'src/paperTheme';

export const FormContainer = styled.View`
  padding: 50px;
  padding-top: 100px;
`;

export const Container = withTheme(styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  justify-content: center;
`);
