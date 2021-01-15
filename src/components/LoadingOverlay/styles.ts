import { styled, withTheme } from 'src/paperTheme';

export const Container = withTheme(styled.View`
  position: absolute;
  background-color: ${({ theme }) => theme.colors.background};
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
`);
