import React from 'react';

import { act, render } from 'helpers/testUtils';

import Login from '../Login';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { useRoute } = jest.requireMock('@react-navigation/native');

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it('should render', async () => {
    useRoute.mockReturnValue({
      params: { updateRenderRight: () => undefined },
    });

    const result = render(<Login />);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await act(() => Promise.resolve());

    expect(result).toMatchSnapshot();
  });
});
