import React from 'react';

import { act, render } from 'helpers/testUtils';

import Account from '../Account';

jest.mock('src/pullstate/persistentStore');

describe('AccountScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it('should render', async () => {
    const result = render(<Account />);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await act(() => Promise.resolve());

    expect(result).toMatchSnapshot();
  });
});
