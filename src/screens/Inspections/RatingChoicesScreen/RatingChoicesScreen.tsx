import React, { useLayoutEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, IconButton, Searchbar, useTheme } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { sortBy, xor } from 'lodash/fp';

import { styled } from 'src/paperTheme';
import { INSPECTIONS_FORM, RATING_CHOICES_MODAL } from 'src/navigation/screenNames';
import { MainNavigatorParamList } from 'src/navigation/MainStackNavigator';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import Row from 'src/components/Row';
import { SelectField, SelectRating } from 'src/types';

const Container = styled.View`
  flex: 1;
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;
`;

const ButtonsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 20px;
`;

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

  const handleChangeSearch = (text: string) => {
    setSearchQuery(text);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: (
        <IconButton
          icon="close"
          onPress={() => {
            navigation.goBack();
          }}
          color={theme.colors.surface}
          size={24}
        />
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

  return (
    <Container>
      <ButtonsContainer>
        <Searchbar placeholder="Search" onChangeText={handleChangeSearch} value={searchQuery} />
      </ButtonsContainer>
      <View style={{ flex: 1, width: '100%' }}>
        {sortBy(
          'position',
          rating.range_choices.map((choice) => (
            <Row
              icon={selection.includes(choice.id) ? 'check' : undefined}
              label={choice.name}
              onPress={() => {
                if (!isMultiSelect) {
                  setSelection([choice.id]);
                } else {
                  setSelection(xor(selection, [choice.id]));
                }
              }}
            />
          )),
        )}
      </View>
    </Container>
  );
};

export default RatingChoicesScreen;
