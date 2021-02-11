import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { Button, IconButton, Searchbar, useTheme } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { map, sortBy, xor } from 'lodash/fp';
import { debounce } from 'lodash';
import Fuse from 'fuse.js';

import { styled } from 'src/paperTheme';
import { INSPECTIONS_FORM, RATING_CHOICES_MODAL } from 'src/navigation/screenNames';
import { MainNavigatorParamList } from 'src/navigation/MainStackNavigator';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import Row from 'src/components/Row';
import { SelectField, SelectRating, SelectRatingChoice } from 'src/types';

const Container = styled.View`
  flex: 1;
  width: 100%;
`;

const ButtonsContainer = styled.View`
  margin: 20px;
`;

const maxPatternLength = 32;
const fuseOptions = {
  shouldSort: true,
  tokenize: true,
  maxPatternLength,
  minMatchCharLength: 1,
  threshold: 0.3,
  location: 0,
  keys: ['name'],
};

const RatingChoicesScreen: React.FC = () => {
  const {
    params: { assignmentId, ratingId, formFieldId },
  } = useRoute<RouteProp<MainNavigatorParamList, typeof RATING_CHOICES_MODAL>>();
  const [searchQuery, setSearchQuery] = useState('');

  const rating = PersistentUserStore.useState((s) => s.ratings[ratingId] as SelectRating);
  const draft = PersistentUserStore.useState((s) => (assignmentId ? s.drafts[assignmentId] : undefined));
  const listChoiceIds = (draft?.fields[formFieldId] as SelectField)?.list_choice_ids || [];

  const [selection, setSelection] = useState(listChoiceIds);

  const navigation = useNavigation();
  const theme = useTheme();

  const isMultiSelect = rating.rating_type_id === 9;
  const [ratingChoices, setRatingChoices] = useState(sortBy('position', rating.range_choices));
  const fuse = useRef(new Fuse(ratingChoices, fuseOptions));
  const flatListRef = useRef<FlatList<SelectRatingChoice>>(null);

  useEffect(() => {
    fuse.current = new Fuse(rating.range_choices, fuseOptions);
  }, [rating.range_choices]);

  const scrollToTop = useCallback(() => {
    try {
      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    } catch (error) {
      console.warn('Rating Choices scrollToTop error: ', error);
    }
  }, [flatListRef]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const search = useCallback(
    debounce(
      (searchStr: string, doScroll = true) => {
        if (doScroll) {
          scrollToTop();
        }

        if (!searchStr) {
          // empty search query
          setRatingChoices(sortBy('position', rating.range_choices));
        } else {
          setRatingChoices(map('item', fuse.current?.search(searchStr) || []));
        }
      },
      300,
      { leading: false, trailing: true },
    ),
    [scrollToTop, rating.range_choices],
  );

  const handleChangeSearch = (text: string) => {
    setSearchQuery(text);
    search(text);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: (
        <Button
          onPress={() => {
            navigation.goBack();
          }}
          color={theme.colors.surface}
        >
          Cancel
        </Button>
      ),
      headerRight: (
        <IconButton
          icon="check"
          onPress={() => {
            navigation.navigate(INSPECTIONS_FORM, {
              rangeChoicesSelection: {
                listChoiceIds: selection,
                formFieldId,
              },
            });
          }}
          color={theme.colors.surface}
          size={24}
        />
      ),
    });
  }, [formFieldId, navigation, selection, theme]);

  // TODO: improve perf of Row rendering

  return (
    <Container>
      <ButtonsContainer>
        <Searchbar
          placeholder="Search"
          onChangeText={handleChangeSearch}
          maxLength={maxPatternLength}
          value={searchQuery}
        />
      </ButtonsContainer>
      <FlatList
        ref={flatListRef}
        contentContainerStyle={{
          justifyContent: 'flex-start',
        }}
        data={ratingChoices}
        keyExtractor={(item) => `${item.id}`}
        renderItem={({ item }) => (
          <Row
            icon={selection.includes(item.id) ? 'check' : undefined}
            label={item.name}
            onPress={() => {
              if (!isMultiSelect) {
                setSelection([item.id]);
              } else {
                setSelection(xor(selection, [item.id]));
              }
            }}
          />
        )}
      />
    </Container>
  );
};

export default RatingChoicesScreen;
