import React from 'react';
require('jest-fetch-mock').enableMocks();

jest.mock('react-native-screens', () => {
  const RealComponent = jest.requireActual('react-native-screens');
  RealComponent.enableScreens = jest.fn();

  return RealComponent;
});

/**
 * Mock TouchableOpacity using TouchableHighlight to avoid a bug on RN
 * https://github.com/testing-library/native-testing-library/issues/113
 * https://github.com/facebook/react-native/issues/27721
 */
jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity.js', () => {
  const { TouchableHighlight } = require('react-native');
  const MockTouchable = (props) => {
    return <TouchableHighlight {...props} />;
  };
  MockTouchable.displayName = 'TouchableOpacity';

  return MockTouchable;
});

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  RN.View.prototype.measureInWindow = jest.fn((callback) => {
    callback(0, 0, 42, 42);
  });

  return RN;
});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

// The following line is required for react-query: https://github.com/tannerlinsley/react-query/issues/126
global.window = global;

afterAll(() => {
  require('react-query').queryCache.clear();
});

// We set this to avoid console.error or .warn coming from react-query to pollute our tests output
beforeAll(() => {
  require('react-query').setConsole({
    log: (...args) => undefined,
    warn: (...args) => undefined,
    error: (...args) => undefined,
  });
});
