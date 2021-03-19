import React from 'react';
import { Divider, Paragraph, Text, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native';
import { escapeRegExp, sortBy, words } from 'lodash/fp';

import NavRow from 'src/components/NavRow';
import { SearchStore } from 'src/pullstate/searchStore';
import { INSPECTIONS_CHILDREN, INSPECTIONS_FORM_LIST } from 'src/navigation/screenNames';
import { styled, withTheme } from 'src/paperTheme';
import { Structure } from 'src/types';
import LoadingOverlay from 'src/components/LoadingOverlay';

const Container = withTheme(
  styled.View`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.background};
    justify-content: center;
  `,
);

const BlankContentContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 30px;
`;

const BlankScreen: React.FC<{ searchInput: string }> = ({ searchInput }) => (
  <BlankContentContainer>
    <Title>No Results</Title>
    <Paragraph style={{ marginTop: 0 }}>for "{searchInput}"</Paragraph>
  </BlankContentContainer>
);

interface RowProps extends Structure {
  searchInput: string;
}

function splitWord(input: string, word: string) {
  const splitted = input.split(new RegExp(escapeRegExp(word), 'i'));
  let lastIndex = 0;

  return splitted.flatMap((value, i) => {
    if (i === splitted.length - 1) {
      return [value];
    }

    if (value === '') {
      lastIndex += word.length;
      return [input.slice(lastIndex - word.length, lastIndex)];
    }

    lastIndex += value.length;

    return [value, input.slice(lastIndex, lastIndex + word.length)];
  });
}

const Row: React.FC<RowProps> = React.memo((props) => {
  const navigation = useNavigation();

  const boldWords = words(props.searchInput).map((w) => w.toLowerCase());

  const label = boldWords
    .reduce(
      (acc, boldWord) => {
        return acc.flatMap((value) => splitWord(value, boldWord));
      },
      [props.location_path || props.display_name],
    )
    .map((section, i) => {
      if (boldWords.includes(section.toLowerCase())) {
        return (
          <Text style={{ fontWeight: 'bold' }} key={i}>
            {section}
          </Text>
        );
      }
      return <Text key={i}>{section}</Text>;
    });

  return (
    <NavRow
      label={<Text>{label}</Text>}
      onPress={() => {
        if (props.active_children_count > 0) {
          navigation.navigate({
            name: INSPECTIONS_CHILDREN,
            key: 'search',
            params: {
              parentId: props.id,
              title: props.display_name,
              showLocationPath: false,
            },
          });
        } else {
          navigation.navigate(INSPECTIONS_FORM_LIST, { parentId: props.id, title: props.display_name });
        }
      }}
    />
  );
});

const SearchScreen: React.FC<{}> = () => {
  const { results, lastSearch, isLoading, showResults } = SearchStore.useState((s) => ({
    results: s.results,
    lastSearch: s.lastSearch,
    isLoading: s.isLoading,
    showResults: s.showResults,
  }));

  if (isLoading) {
    // TODO: check if this is necessary, seems like searching is way too fast
    return (
      <Container>
        <LoadingOverlay />
      </Container>
    );
  }

  if (!showResults) {
    return <Container />;
  }

  if (results.length === 0) {
    return (
      <Container>
        <BlankScreen searchInput={lastSearch} />
      </Container>
    );
  }

  const searchResults = sortBy('location_path', results);

  return (
    <Container>
      <FlatList
        contentContainerStyle={{
          justifyContent: 'flex-start',
        }}
        data={searchResults}
        ItemSeparatorComponent={Divider}
        renderItem={({ item }) => <Row {...item} searchInput={lastSearch} />}
        keyExtractor={(item) => `${item.id}`}
      />
    </Container>
  );
};

export default SearchScreen;
