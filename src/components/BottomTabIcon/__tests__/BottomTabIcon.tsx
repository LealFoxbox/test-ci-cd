import React from 'react';
import { render } from '@testing-library/react-native';

import BottomTabIcon from '../BottomTabIcon';

describe('BottomTabIcon', () => {
  it('should render', () => {
    const result = render(<BottomTabIcon icon="warning" name="warning" />);

    expect(result).toMatchSnapshot();
  });
});
