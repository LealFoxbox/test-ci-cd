import React from 'react';
import { render } from '@testing-library/react-native';

import NavRow from '../NavRow';

describe('NavRow', () => {
  it('should render', () => {
    const result = render(<NavRow label="label" icon="chevron-left" onPress={() => undefined} />);

    expect(result).toMatchSnapshot();
  });
});
