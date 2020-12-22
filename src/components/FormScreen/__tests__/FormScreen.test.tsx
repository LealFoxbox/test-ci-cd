import React from 'react';

import { act, render } from 'helpers/testUtils';

import WebViewScreen from '../FormScreen';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { useRoute } = jest.requireMock('@react-navigation/native');

describe('WebViewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it('should render', async () => {
    useRoute.mockReturnValue({
      params: { updateRenderRight: () => undefined },
    });

    const result = render(<WebViewScreen source={{ uri: 'https://google.com' }} />);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await act(() => Promise.resolve());

    expect(result).toMatchSnapshot();
  });
});
