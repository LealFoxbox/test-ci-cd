import React from 'react';
import { render } from '@testing-library/react-native';

import LoadingOverlay from '../LoadingOverlay';

describe('LoadingOverlay', () => {
  it('should render', () => {
    const result = render(<LoadingOverlay />);

    expect(result).toMatchSnapshot();
  });
});
