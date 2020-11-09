import React from 'react';

import { act, render } from 'helpers/testUtils';

import Schedule from '../Schedule';

jest.mock('src/contexts/userSession');

describe('ScheduleScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it('should render', async () => {
    const result = render(<Schedule />);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await act(() => Promise.resolve());

    expect(result).toMatchSnapshot();
  });
});
