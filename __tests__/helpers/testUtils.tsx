/* eslint-disable */
export const mockGoBack = jest.fn();
export const mockNavigate = jest.fn();
export const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => {
  const navigationNative = jest.requireActual('@react-navigation/native');
  return {
    ...navigationNative,
    useNavigation: () => {
      const useNavigation = navigationNative.useNavigation();
      return {
        ...useNavigation,
        goBack: mockGoBack,
        navigate: mockNavigate,
        replace: mockReplace,
      };
    },
    useRoute: jest.fn(),
  };
});

jest.mock('@react-navigation/stack', () => ({
  /* @ts-ignore */
  ...jest.requireActual('@react-navigation/stack'),
  useHeaderHeight: () => 88,
}));

import React, { ComponentType, ReactElement, ReactNode } from 'react';
import { RenderAPI, render } from '@testing-library/react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

import { UserSessionProvider } from 'src/contexts/userSession';
import paperTheme from 'src/paperTheme';

const AllTheProviders = ({ children }: { children: ReactNode }): ReactElement => {
  return (
    <NavigationContainer>
      <UserSessionProvider>
        <PaperProvider theme={paperTheme}>
          <SafeAreaProvider
            initialMetrics={{
              insets: { top: 0, bottom: 0, right: 0, left: 0 },
              frame: { width: 0, height: 0, x: 0, y: 0 },
            }}
          >
            {children}
          </SafeAreaProvider>
        </PaperProvider>
      </UserSessionProvider>
    </NavigationContainer>
  );
};

interface Options {
  wrapper?: any;
  [_: string]: any;
}

export const renderWithProviders = (ui: ReactElement, options?: Options): RenderAPI =>
  render(ui, { wrapper: AllTheProviders, ...(options || {}) });

export const renderInTabs = (screenComponent: ComponentType<any>, routeParams?: any): RenderAPI => {
  const { Navigator, Screen } = createBottomTabNavigator();

  return renderWithProviders(
    <Navigator>
      <Screen name="ComponentToTest" component={screenComponent} initialParams={routeParams} />
    </Navigator>,
  );
};

export const renderInStack = (screenComponent: ComponentType<any>, routeParams?: any): RenderAPI => {
  const { Navigator, Screen } = createStackNavigator();

  return renderWithProviders(
    <Navigator>
      <Screen name="ScreenToTest" component={screenComponent} initialParams={routeParams} />
    </Navigator>,
  );
};

const customRender = (ui: ReactElement): RenderAPI => {
  return renderInTabs(() => ui);
};

export * from '@testing-library/react-native';
export { customRender as render };
