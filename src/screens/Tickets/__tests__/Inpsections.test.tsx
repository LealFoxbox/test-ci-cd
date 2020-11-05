import React from 'react';

import { act, render } from 'helpers/testUtils';

import Tickets from '../Tickets';

jest.mock('src/contexts/userSession');

describe('TicketsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it('should render', async () => {
    const result = render(<Tickets />);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await act(() => Promise.resolve());

    expect(result).toMatchSnapshot();
  });
});
