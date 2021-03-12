/* eslint-disable react-native/no-color-literals */
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Appbar, TextInput } from 'react-native-paper';
import Fuse from 'fuse.js';
import { map } from 'lodash/fp';
import { debounce } from 'lodash';

import { transparentTheme } from 'src/paperTheme';
import { SearchStore } from 'src/pullstate/searchStore';
import { Structure } from 'src/types';
import * as dbHooks from 'src/services/mongoHooks';

interface SearchHeaderProps {
  onClose: () => void;
  hasSubheader: boolean;
}

const maxPatternLength = 32;
const fuseOptions = {
  shouldSort: true,
  tokenize: true,
  maxPatternLength,
  minMatchCharLength: 1,
  threshold: 0.3,
  location: 0,
  keys: ['display_name'],
};

const SearchHeader: React.FC<SearchHeaderProps> = ({ onClose, hasSubheader }) => {
  const [searchInput, setSearch] = useState<string>('');
  const [structures, isLoading, isComplete] = dbHooks.structures.useGetAll();
  const fuse = useRef(new Fuse(structures, fuseOptions));

  function setResults(results: Structure[]) {
    SearchStore.update((s) => {
      return {
        ...s,
        results,
      };
    });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const search = useCallback(
    debounce(
      (searchStr: string) => {
        if (!searchStr) {
          // empty search query
          SearchStore.update((s) => {
            return {
              ...s,
              showResult: false,
            };
          });
        } else {
          setResults(map('item', fuse.current?.search(searchStr) || []));
        }
      },
      300,
      { leading: false, trailing: true },
    ),
    [],
  );

  const handleChangeSearch = (text: string) => {
    setSearch(text);
    search(text);
  };

  return (
    <Appbar.Header dark style={{ elevation: hasSubheader ? 0 : 4 }}>
      <Appbar.BackAction onPress={onClose} />
      <TextInput
        placeholder="Search areas..."
        onChangeText={handleChangeSearch}
        value={searchInput || ''}
        theme={transparentTheme}
        underlineColor="transparent"
        selectionColor="#88888888"
        maxLength={maxPatternLength}
        dense
        style={{ flex: 1, marginRight: 20, fontSize: 20 }}
        right={isLoading || !isComplete ? <ActivityIndicator size="small" /> : null}
      />
    </Appbar.Header>
  );
};

export default SearchHeader;
