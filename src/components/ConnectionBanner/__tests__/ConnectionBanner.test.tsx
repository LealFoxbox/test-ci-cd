import React from 'react';
import { render } from '@testing-library/react-native';

import ConnectionBanner from '../ConnectionBanner';

describe('ConnectionBanner', () => {
  it('should render', () => {
    const result = render(<ConnectionBanner connected={false} />);

    expect(result).toMatchSnapshot();
  });
});
