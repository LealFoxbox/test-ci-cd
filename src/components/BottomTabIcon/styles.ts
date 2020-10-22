import styled from 'styled-components/native';

export const iconSize = 28;
const lineExtraWidth = 12;

export const Container = styled.View`
  flex: 1;
`;

export const IconContainer = styled.View`
  flex: 1;
  justify-content: center;
  margin-left: ${lineExtraWidth}px;
`;

export const Line = styled.View<{ focused: boolean; color?: string }>`
  width: ${iconSize + lineExtraWidth * 2}px;
  height: 2px;
  background-color: ${({ focused, color }) => (focused && color ? color : 'transparent')};
`;
