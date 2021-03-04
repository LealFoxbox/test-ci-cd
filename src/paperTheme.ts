/* eslint-disable @typescript-eslint/no-namespace */
import { DefaultTheme, withTheme as paperWithTheme } from 'react-native-paper';
import * as styledComponents from 'styled-components/native';

const customColors = {
  deficient: '#FF3333',
  gps: '#007AFE',
  success: '#34C759',
};

type CustomColors = typeof customColors;

const paperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF9400',
    accent: '#F2680E',
    background: '#e9e9e9',
    surface: '#FFFFFF',
    error: '#FF2D55',
    text: '#000000',
    onBackground: '#000000',
    onSurface: '#FF9400',
    notification: '#FF9400',

    ...customColors,
  },
};

// Fix the type according to https://callstack.github.io/react-native-paper/theming.html#typescript
declare global {
  namespace ReactNativePaper {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ThemeColors extends CustomColors {}
  }
}

export type PaperTheme = typeof paperTheme;

const {
  default: styled,
  css,
} = (styledComponents as unknown) as styledComponents.ReactNativeThemedStyledComponentsModule<PaperTheme>;

export { css, styled };

export const withTheme = (WrrappedComponent: any) => paperWithTheme<{ theme: PaperTheme }, any>(WrrappedComponent);

export default paperTheme;
