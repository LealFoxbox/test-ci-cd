import { compose, fromPairs, mapValues, set } from 'lodash/fp';
import { v4 as uuidv4 } from 'uuid';

import { deleteAllJSONFiles } from 'src/services/downloader/fileUtils';
import { cleanMongo } from 'src/services/mongodb';
import {
  Assignment,
  DraftField,
  DraftForm,
  Form,
  NumberField,
  PointsField,
  Rating,
  ScoreField,
  SelectField,
  SignatureField,
  TextField,
  User,
} from 'src/types';

import { DownloadStore } from './downloadStore';
import { PersistentState, initialState } from './persistentStore/initialState';
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

    const baseField = {
      name: field.display_name,
      deleted: false,

      rating_id: rating.id,
      formFieldId: field.id,
      weight: field.weight,
      position: field.position,
      description: field.description,
      category_id: field.category_id,
      comment: null,
      photos: [],

      ratingTypeId: rating.rating_type_id,
    };

    switch (rating.rating_type_id) {
      case 1:
        return {
          ...baseField,
          selectedChoice: null,
          minPosition: rating.range_choices.reduce(
            (acc, curr) => Math.min(curr.position, acc),
            rating.range_choices[0]?.position || Infinity,
          ),
          maxPosition: rating.range_choices.reduce((acc, curr) => Math.max(curr.position, acc), 0),
        } as ScoreField;

      case 3:
        return { ...baseField, comment: '' } as TextField;

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

          selectedChoice: null,
        } as PointsField;
      case 8:
      case 9:
        return {
          ...baseField,
          list_choice_ids: [],
        } as SelectField;

      default:
        return { ...baseField, comment: '' } as TextField;
    }
  });

  const result: DraftForm = {
    name: form.name,
    assignmentId: assignment.id,
    formId: form.id,
    structureId: assignment.structure_id,
    started_at: Date.now(),
    ended_at: null,
    guid: uuidv4() as string,
    flagged: false,
    private: form.private_inspection || false,
    latitude: null,
    longitude: null,
    fields: fromPairs(fields.map((field) => [field.formFieldId, field])),
    isDirty: false,

    notes: form.notes,
    categories: fromPairs(form.categories.map((c) => [c.id, c.name])),
    privateInspection: form.private_inspection,
  };

  return result;
}

export const initFormDraftAction = (form: Form, assignment: Assignment, ratings: Record<string, Rating>) => {
  PersistentUserStore.update((s) => {
    if (!s.drafts[assignment.id]) {
      return set(`drafts.${assignment.id}`, createEmptyDraftForm(form, assignment, ratings), s);
    }

    return s;
  });
};

export const updateDraftFieldsAction = (assignmentId: number, formValues: Record<string, DraftField>) => {
  PersistentUserStore.update((s) => {
    const isDirtySetter = set(`drafts.${assignmentId}.isDirty`, true);

    const fieldsSetter = set(
      `drafts.${assignmentId}.fields`,
      mapValues((field) => set('comment', field.comment || null, field), formValues),
    );

    // we are intentionally changing the state object reference so that the FlatList notices changes and rerenders
    // seems like immerJs does not play well with the virtualization
    return compose([isDirtySetter, fieldsSetter])(s) as PersistentState;
  });
};

export const submitDraftAction = (assignmentId: number) => {
  PersistentUserStore.update((s) => {
    s.pendingUploads.push({
      draft: s.drafts[assignmentId],
      error: null,
      progress: 0,
      uploading: null,
      photoUploadUrls: {},
    });
    delete s.drafts[assignmentId];
  });
};
