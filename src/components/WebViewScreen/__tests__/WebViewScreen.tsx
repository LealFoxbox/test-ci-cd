import React from 'react';

import { act, render } from 'helpers/testUtils';

import WebViewScreen from '../WebViewScreen';

jest.mock('src/contexts/userSession');

describe('WebViewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it('should render', async () => {
    const result = render(<WebViewScreen source={{ uri: 'https://google.com' }} />);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await act(() => Promise.resolve());

    expect(result).toMatchSnapshot();
  });
});
