/* eslint-disable @typescript-eslint/no-namespace */
import { DefaultTheme, withTheme as paperWithTheme } from 'react-native-paper';
import * as styledComponents from 'styled-components/native';

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

    // custom colors:
    deficient: '#FF3333',
  },
};

// Fix the type according to https://callstack.github.io/react-native-paper/theming.html#typescript
declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      deficient: string;
    }
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
