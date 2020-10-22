const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockReplace = jest.fn();

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
import { RenderResult, render } from '@testing-library/react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

import { UserSessionProvider } from 'src/contexts/userSession';
import paperTheme from 'src/paperTheme';

const { NavigationAnalyticsContainer } = jest.requireActual('src/services/analytics');

const AllTheProviders = ({ children }: { children: ReactNode }): ReactElement => {
  return (
    <NavigationAnalyticsContainer>
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
    </NavigationAnalyticsContainer>
  );
};

interface Options {
  wrapper?: any;
  [_: string]: any;
}

const renderWithProviders = (ui: ReactElement, options?: Options): RenderResult =>
  render(ui, { wrapper: AllTheProviders, ...(options || {}) });

const renderInTabs = (screenComponent: ComponentType<any>, routeParams?: any): RenderResult => {
  const { Navigator, Screen } = createBottomTabNavigator();

  return renderWithProviders(
    <Navigator>
      <Screen name="ComponentToTest" component={screenComponent} initialParams={routeParams} />
    </Navigator>,
  );
};

const renderInStack = (screenComponent: ComponentType<any>, routeParams?: any): RenderResult => {
  const { Navigator, Screen } = createStackNavigator();

  return renderWithProviders(
    <Navigator>
      <Screen name="ScreenToTest" component={screenComponent} initialParams={routeParams} />
    </Navigator>,
  );
};

const customRender = (ui: ReactElement): RenderResult => {
  return renderInTabs(() => ui);
};

export * from '@testing-library/react-native';
export {
  customRender as render,
  mockGoBack,
  mockNavigate,
  mockReplace,
  renderInStack,
  renderInTabs,
  renderWithProviders,
};
