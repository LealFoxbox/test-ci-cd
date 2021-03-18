import React, { useState } from 'react';
import { StackHeaderProps } from '@react-navigation/stack';
import { Appbar } from 'react-native-paper';

import SearchHeader from '../SearchHeader';

type Params = undefined | { title: string; hasSubheader: boolean; hasSearch: boolean };

const Header: React.FC<StackHeaderProps> = (props) => {
  const params = props.scene.route.params as Params;
  const [showSearchInput, setShowSearchInput] = useState(false);
  const hasSearchEnabled = !!params?.hasSearch;
  const left = props.scene.descriptor.options.headerLeft || null;
  const right = props.scene.descriptor.options.headerRight || null;

  function getLeft() {
    if (typeof left === 'function') {
      return left({});
    }

    if (left) {
      return left;
    }

    if (props.previous) {
      return (
        <Appbar.BackAction
          onPress={() => {
            props.navigation.goBack();
          }}
        />
      );
    }

    return null;
  }

  function getRight() {
    if (hasSearchEnabled && !showSearchInput) {
      return (
        <Appbar.Action
          icon="magnify"
          onPress={() => {
            setShowSearchInput(true);
          }}
        />
      );
    }

    if (typeof right === 'function') {
      return right({});
    }

    return right;
  }

  if (hasSearchEnabled && showSearchInput) {
    return <SearchHeader {...props} onClose={() => setShowSearchInput(false)} isInspection />;
  }

  return (
    <Appbar.Header dark style={{ elevation: params?.hasSubheader ? 0 : 4 }}>
      {getLeft()}
      <Appbar.Content title={params?.title} style={{ flex: 1 }} />
      {getRight()}
    </Appbar.Header>
  );
};

export default Header;
