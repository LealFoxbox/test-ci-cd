import { sortBy, uniqueId } from 'lodash/fp';

import { deleteAllJSONFiles } from 'src/services/downloader/fileUtils';
import { cleanMongo } from 'src/services/mongodb';
import {
  Assignment,
  BaseField,
  DraftField,
  DraftForm,
  Form,
  NumberField,
  PercentageField,
  PointsField,
  Rating,
  SelectField,
  SignatureField,
  TextField,
  User,
} from 'src/types';

import { DownloadStore } from './downloadStore';
import { initialState } from './persistentStore/initialState';
import { PersistentUserStore } from './persistentStore';

export const loginAction = (user: User) => {
  PersistentUserStore.update((s) => {
    s.userData = user;
    s.status = 'loggedIn';
  });
};

export const logoutAction = async () => {
  await deleteAllJSONFiles();
  await cleanMongo();

  PersistentUserStore.update((s) => {
    for (const key of Object.keys(s)) {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      s[key] = initialState[key];
    }
    s.status = 'shouldLogIn';
  });
};

export const setStagingAction = (isStaging: boolean) => {
  PersistentUserStore.update((s) => {
    s.isStaging = isStaging;
  });
};

export const updateStructuresMeta = (currentPage: number, totalPages: number) => {
  PersistentUserStore.update((s) => {
    s.structuresDbMeta = { currentPage, totalPages };
  });
};

export const updateAssignmentsMeta = (currentPage: number, totalPages: number) => {
  PersistentUserStore.update((s) => {
    s.assignmentsDbMeta = { currentPage, totalPages };
  });
};

export async function clearInspectionsDataAction() {
  await deleteAllJSONFiles();
  await cleanMongo();
  DownloadStore.update((s) => {
    s.progress = 0;
    s.error = null;
  });
  PersistentUserStore.update((s) => {
    s.forms = initialState.forms;
    s.ratings = initialState.ratings;
    s.ratingsDownloaded = initialState.ratingsDownloaded;
    s.assignmentsDbMeta = initialState.assignmentsDbMeta;
    s.structuresDbMeta = initialState.structuresDbMeta;
    s.lastUpdated = initialState.lastUpdated;
  });
}

// FORM ACTIONS

function createEmptyDraftForm(form: Form, assignment: Assignment, ratings: Record<string, Rating>) {
  const fields = form.inspection_form_items.map((field) => {
    const rating = ratings[field.rating_id];

    const baseField: BaseField = {
      name: field.display_name,

      rating_id: rating.id,
      line_item_id: field.id,
      weight: field.weight,
      position: field.position,
      description: field.description,
      category_id: field.category_id,
      comment: '',
      inspection_item_photos: [],

      ratingTypeId: rating.rating_type_id,
    };

    switch (rating.rating_type_id) {
      case 1:
        return {
          ...baseField,
          range_choice_label: null,
          range_choice_position: null,
          range_choice_max_position: null,
          range_choice_min_position: null,
          score: null,
          deficient: null,
        } as PercentageField;

      case 3:
        return baseField as TextField;

      case 5:
        return baseField as SignatureField;

      case 6:
        return {
          ...baseField,
          number_choice: null,
        } as NumberField;
      case 7:
        return {
          ...baseField,

          deficient: null,
          range_choice_label: null,
          range_choice_position: null,
          points: null,
        } as PointsField;
      case 8:
      case 9:
        return {
          ...baseField,
          list_choice_ids: [],
        } as SelectField;

      default:
        return baseField as TextField;
    }
  });

  const result: DraftForm = {
    name: form.name,
    assignmentId: assignment.id,
    formId: form.id,
    structureId: assignment.structure_id,
    started_at: Date.now(),
    ended_at: null,
    guid: `${Date.now()}${uniqueId('')}`,
    flagged: false,
    private: form.private_inspection || false,
    latitude: null,
    longitude: null,
    fields: sortBy('position', fields),
    isDirty: false,

    notes: form.notes,
    categories: form.categories,
    privateInspection: form.private_inspection,
  };

  return result;
}

export const initFormDraftAction = (form: Form, assignment: Assignment, ratings: Record<string, Rating>) => {
  PersistentUserStore.update((s) => {
    if (!s.drafts[assignment.id]) {
      s.drafts[assignment.id] = createEmptyDraftForm(form, assignment, ratings);
    }
  });
};

export const updateDraftFieldsAction = (assignmentId: number, formValues: Record<string, DraftField>) => {
  PersistentUserStore.update((s) => {
    s.drafts[assignmentId].fields = Object.values(formValues);
    s.drafts[assignmentId].isDirty = true;
  });
};
