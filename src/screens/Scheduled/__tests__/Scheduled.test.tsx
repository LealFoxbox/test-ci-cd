import React from 'react';

import { act, render } from 'helpers/testUtils';

import Scheduled from '../Scheduled';

jest.mock('src/contexts/userSession');

describe('ScheduledScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it('should render', async () => {
    const result = render(<Scheduled />);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await act(() => Promise.resolve());

    expect(result).toMatchSnapshot();
  });
});
