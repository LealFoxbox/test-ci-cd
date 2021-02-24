import React from 'react';
import { render } from '@testing-library/react-native';

import UploadRow from '../UploadRow';

describe('UploadRow', () => {
  it('should render', () => {
    const result = render(<UploadRow label="label" value="value" />);

    expect(result).toMatchSnapshot();
  });
});
