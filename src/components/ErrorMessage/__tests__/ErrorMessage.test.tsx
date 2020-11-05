import React from 'react';
import { render } from '@testing-library/react-native';

import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('should render', () => {
    const result = render(<ErrorMessage />);

    expect(result).toMatchSnapshot();
  });
});
