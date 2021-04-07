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
import { InspectionFormParams } from 'src/navigation/InspectionsNavigator';

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

const emptyChoices: SelectRatingChoice[] = [];

const RatingChoicesScreen: React.FC = () => {
  const {
    params: { assignmentId, ratingId, formFieldId, screenName },
  } = useRoute<RouteProp<MainNavigatorParamList, typeof RATING_CHOICES_MODAL>>();
  const [searchQuery, setSearchQuery] = useState('');

  const { rating, draft } = PersistentUserStore.useState((s) => ({
    draft: assignmentId ? s.drafts[assignmentId] : undefined,
    rating: s.ratings[ratingId] as SelectRating | undefined,
  }));

  const listChoiceIds = (draft?.fields[formFieldId] as SelectField)?.list_choice_ids || [];

  const [selection, setSelection] = useState(listChoiceIds);

  const navigation = useNavigation();
  const theme = useTheme();

  const rangeChoices = rating?.range_choices || emptyChoices;
  const isMultiSelect = rating?.rating_type_id === 9;
  const [ratingChoices, setRatingChoices] = useState(sortBy('position', rangeChoices));
  const fuse = useRef(new Fuse(ratingChoices, fuseOptions));
  const flatListRef = useRef<FlatList<SelectRatingChoice>>(null);

  useEffect(() => {
    fuse.current = new Fuse(rangeChoices, fuseOptions);
  }, [rangeChoices]);

  const scrollToTop = useCallback(() => {
    try {
      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    } catch (error) {
      console.warn('Rating Choices Screen scrollToTop error: ', error);
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
          setRatingChoices(sortBy('position', rangeChoices));
        } else {
          setRatingChoices(map('item', fuse.current?.search(searchStr) || []));
        }
      },
      300,
      { leading: false, trailing: true },
    ),
    [scrollToTop, rangeChoices],
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
            // since this is navigating back we don't need to fill in every param for InspectionFormParams
            const rangeChoicesSelection: InspectionFormParams['rangeChoicesSelection'] = {
              listChoiceIds: selection,
              formFieldId,
            };

            navigation.navigate(screenName || INSPECTIONS_FORM, {
              rangeChoicesSelection,
            });
          }}
          color={theme.colors.surface}
          size={24}
        />
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
