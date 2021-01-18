import React from 'react';

import { act, render } from 'helpers/testUtils';

import Inspections from '../InspectionsScreen';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { useRoute } = jest.requireMock('@react-navigation/native');

describe('InspectionsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it('should render', async () => {
    useRoute.mockReturnValue({
      params: { parentId: null },
    });

    const result = render(<Inspections />);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await act(() => Promise.resolve());

    expect(result).toMatchSnapshot();
  });
});
