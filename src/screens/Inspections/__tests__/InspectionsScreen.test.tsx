import React from 'react';

import { act, render } from 'helpers/testUtils';

import Inspections from '../InspectionsScreen';

describe('InspectionsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it('should render', async () => {
    const result = render(<Inspections />);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await act(() => Promise.resolve());

    expect(result).toMatchSnapshot();
  });
});
