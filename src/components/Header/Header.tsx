import React, { useState } from 'react';
import { StackHeaderProps } from '@react-navigation/stack';
import { Appbar } from 'react-native-paper';

import { LoginStore } from 'src/pullstate/loginStore';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { DownloadStore } from 'src/pullstate/downloadStore';
import { selectMongoComplete } from 'src/pullstate/selectors';

import SearchHeader from '../SearchHeader';

// Note: this was separated into its own component due to the great number of checks for the visibility of the search button
const ClosedSearchHeader: React.FC<{ onPressSearch: () => void; title: string; hasSubheader: boolean }> = ({
  onPressSearch,
  title,
  hasSubheader,
}) => {
  const { progress, error } = DownloadStore.useState((s) => ({ progress: s.progress, error: s.error }));
  const { initialized, isMongoComplete } = PersistentUserStore.useState((s) => ({
    initialized: s.initialized,
    isMongoComplete: selectMongoComplete(s),
  }));
  const userData = LoginStore.useState((s) => s.userData);
  const isSearchButtonVisible =
    !error && initialized && progress === 100 && isMongoComplete && userData?.supervisory_structures?.length;

  return (
    <Appbar.Header dark style={{ elevation: hasSubheader ? 0 : 4 }}>
      <Appbar.Content title={title} style={{ flex: 1 }} />
      {isSearchButtonVisible && <Appbar.Action icon="magnify" onPress={onPressSearch} />}
    </Appbar.Header>
  );
};

type Params = undefined | { title: string; hasSubheader: boolean; hasSearch: boolean; goBackCallback?: () => void };

const Header: React.FC<StackHeaderProps> = (props) => {
  const params = props.scene.route.params as Params;
  const [showSearchInput, setShowSearchInput] = useState(false);

  if (params?.hasSearch) {
    if (showSearchInput) {
      return <SearchHeader {...props} onClose={() => setShowSearchInput(false)} isInspection />;
    } else {
      return (
        <ClosedSearchHeader
          hasSubheader={!!params?.hasSubheader}
          title={params?.title || ''}
          onPressSearch={() => {
            setShowSearchInput(true);
          }}
        />
      );
    }
  }

  const left = props.scene.descriptor.options.headerLeft || null;
  const right = props.scene.descriptor.options.headerRight || null;

  function getLeft() {
    if (left) {
      return typeof left === 'function' ? left({}) : left;
    }

    if (props.previous) {
      return (
        <Appbar.BackAction
          onPress={() => {
            typeof params?.goBackCallback === 'function' && params?.goBackCallback();
            props.navigation.goBack();
          }}
        />
      );
    }

    return null;
  }

  return (
    <Appbar.Header dark style={{ elevation: params?.hasSubheader ? 0 : 4 }}>
      {getLeft()}
      <Appbar.Content title={params?.title} style={{ flex: 1 }} />
      {typeof right === 'function' ? right({}) : right}
    </Appbar.Header>
  );
};

export default Header;
