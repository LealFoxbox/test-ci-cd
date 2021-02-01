import React from 'react';
import { View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Button, Title, useTheme } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';
import { Formik } from 'formik';
import { fromPairs, memoize } from 'lodash/fp';

import { ScrollView } from 'src/components/KeyboardAware';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { updateDraftFieldsAction } from 'src/pullstate/actions';
import { INSPECTIONS_FORM } from 'src/navigation/screenNames';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';
import { DraftForm } from 'src/types';

import { Container, FormContainer } from './styles';
import TextCard from './TextCard';

const getInitialValues = memoize((draft: DraftForm) => {
  return fromPairs(draft.fields.map((field) => [field.line_item_id, field]));
});

const EditFormScreen: React.FC<{}> = () => {
  const {
    params: { formId, structureId, assignmentId },
  } = useRoute<RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_FORM>>();

  const userData = PersistentUserStore.useState((s) => s.userData);
  const form = PersistentUserStore.useState((s) => (formId ? s.forms[formId] : undefined));
  const draft = PersistentUserStore.useState((s) => (assignmentId ? s.drafts[assignmentId] : undefined));
  const ratings = PersistentUserStore.useState((s) => s.ratings);
  const theme = useTheme();

  const navigation = useNavigation();

  if (!userData || !formId || !structureId || !form || !assignmentId || !draft) {
    return <View />;
  }

  const initialValues = getInitialValues(draft);

  const submit = () => {
    PersistentUserStore.update((s) => {
      s.pendingUploads.push(s.drafts[assignmentId]);
      delete s.drafts[assignmentId];
    });
    navigation.goBack();
  };

  return (
    <ScrollView>
      <Container>
        <Title>{form.name}</Title>
        <Formik initialValues={initialValues} onSubmit={submit}>
          {({ values, setFieldValue, handleSubmit }) => (
            <FormContainer>
              {form.inspection_form_items.map((formItem) => {
                const r = ratings[formItem.rating_id];
                //if (r.rating_type_id === 3) {
                const inputProps: TextInputProps = {
                  value: values[formItem.id].comment || '',
                  onChangeText: (value) => {
                    setFieldValue(`${formItem.id}`, { ...values[formItem.id], comment: value });
                  },
                  onBlur: () => updateDraftFieldsAction(assignmentId, values),
                  label: formItem.display_name,
                  theme,
                };

                return <TextCard key={formItem.id} formItem={formItem} inputProps={inputProps} />;
                //}

                return null;
              })}
              <Button
                onPress={handleSubmit}
                mode="contained"
                dark
                style={{ width: 120, alignSelf: 'flex-end', marginTop: 10 }}
              >
                Submit
              </Button>
            </FormContainer>
          )}
        </Formik>
      </Container>
    </ScrollView>
  );
};

export default EditFormScreen;
