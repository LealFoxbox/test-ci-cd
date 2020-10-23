module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  automock: false,
  setupFiles: ['<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', '<rootDir>/jest.setup.js'],
  collectCoverageFrom: ['src/**/*.{js,ts,tsx}'],
  coveragePathIgnorePatterns: ['/node_modules/', 'assets', 'e2e', '__tests__', '(config|styles|types).ts'],
  modulePathIgnorePatterns: ['package', 'assets', 'lib', '<rootDir>/.*/__mocks__'],
  moduleNameMapper: {
    '\\.svg': '<rootDir>/__mocks__/svgAssets/svgMock.js',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'babel-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e/', '__tests__/helpers/', '__mocks__', 'ios', 'android'],
  transformIgnorePatterns: ['node_modules/(?!react-native|react-navigation)/'],
  testRegex: '(/__tests__/.*|\\.test)\\.(ts|tsx|js|jsx)$',
  moduleDirectories: ['node_modules', '__tests__', __dirname],
  // TODO-SETUP: enable coverage and set expected threshold values
  coverageReporters: ['lcov', 'text', 'text-summary'],
  collectCoverage: true,
  // coverageThreshold: {
  //   global: {
  //     branches: 10,
  //     functions: 10,
  //     lines: 10,
  //     statements: 10,
  //   },
  // },
};
