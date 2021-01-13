import { styled, withTheme } from 'src/paperTheme';

export const MessageContainer = styled.View`
  flex: 1;
  justify-content: center;
  padding: 30px;
`;

export const Container = withTheme(styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  justify-content: center;
`);
