import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';

import UploadRow from '../UploadRow';

describe('UploadRow', () => {
  it('should render', () => {
    const result = render(<UploadRow head="head" title="title" content={<View />} icon="user" />);

    expect(result).toMatchSnapshot();
  });
});
