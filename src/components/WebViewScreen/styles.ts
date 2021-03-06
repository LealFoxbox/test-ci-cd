import { styled, withTheme } from 'src/paperTheme';

export const ScrollViewContainer = styled.ScrollView`
  flex: 1;
`;

export const Container = styled.View`
  flex: 1;
`;

export const MessageContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const DisabledOverlay = withTheme(
  styled.View`
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background-color: ${(p) => p.theme.colors.backdrop};
    opacity: 0.45;
  `,
);
