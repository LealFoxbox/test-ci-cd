import React from 'react';
import { render } from '@testing-library/react-native';

import Row from '../Row';

describe('Row', () => {
  it('should render', () => {
    const result = render(<Row label="label" value="value" />);

    expect(result).toMatchSnapshot();
  });
});
