import React, { useEffect } from 'react';
import { Appbar, TextInput } from 'react-native-paper';
import { StackHeaderProps } from '@react-navigation/stack';
import { words } from 'lodash/fp';

import { transparentTheme } from 'src/paperTheme';
import { SearchStore } from 'src/pullstate/searchStore';
import { INSPECTIONS_SEARCH_RESULTS } from 'src/navigation/screenNames';
import { structuresDb } from 'src/services/mongodb';
import { Structure } from 'src/types';

interface SearchHeaderProps extends StackHeaderProps {
  onClose?: () => void;
  isInspection?: boolean;
}

function hasWords(input: string) {
  return words(input).length > 0;
}

type Params = undefined | { hasSubheader: boolean };

const SearchHeader: React.FC<SearchHeaderProps> = ({ onClose, scene, navigation, isInspection }) => {
  const params = scene.route.params as Params;
  const hasSubheader = !!params?.hasSubheader;
  const searchInput = SearchStore.useState((s) => s.searchInput);

  const makeChangeResultsHandler = (input: string) => (r: Structure[]) => {
    SearchStore.update((s) => ({ ...s, isLoading: false, showResults: true, results: r, lastSearch: input }));

    if (isInspection && hasWords(searchInput)) {
      navigation.navigate(INSPECTIONS_SEARCH_RESULTS);
      onClose && onClose();
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (hasWords(searchInput)) {
        SearchStore.update((s) => ({ ...s, isLoading: true }));
        void structuresDb.search(searchInput).then(makeChangeResultsHandler(searchInput));
      }
    }, 300);

    return () => {
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleChangeSearch = (text: string) => {
    SearchStore.update((s) => {
      if (!hasWords(text)) {
        return { ...s, searchInput: text, showResults: false };
      }
      return { ...s, searchInput: text };
    });
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigation.goBack();
    }
    SearchStore.update((s) => ({ ...s, searchInput: '' }));
  };

  return (
    <Appbar.Header dark style={{ elevation: hasSubheader ? 0 : 4 }}>
      <Appbar.BackAction onPress={handleClose} />
      <TextInput
        placeholder="Search areas..."
        onChangeText={handleChangeSearch}
        value={searchInput}
        theme={transparentTheme}
        underlineColor="transparent"
        selectionColor="#88888888"
        dense
        style={{ flex: 1, marginRight: 20, fontSize: 20 }}
        autoFocus
      />
    </Appbar.Header>
  );
};

export default SearchHeader;
