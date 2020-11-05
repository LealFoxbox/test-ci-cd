import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';

import { ScrollView } from '../KeyboardAware';

describe('KeyboardAware.ScrollView', () => {
  it('should render', () => {
    const result = render(
      <ScrollView>
        <View />
      </ScrollView>,
    );

    expect(result).toMatchSnapshot();
  });
});
