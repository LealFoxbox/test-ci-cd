import { fromPairs, mapValues, omit, pick, pipe, sample, sampleSize, set } from 'lodash/fp';
import { v4 as uuidv4 } from 'uuid';

import { deleteAllJSONFiles } from 'src/services/downloader/fileUtils';
import { cleanMongo } from 'src/services/mongodb';
import config from 'src/config';
import {
  DraftField,
  DraftForm,
  DraftFormUpload,
  Form,
  NumberField,
  PointsField,
  Rating,
  ScoreField,
  SelectField,
  SignatureField,
  Structure,
  TextField,
  User,
} from 'src/types';

import { initialState as downloadInitialState } from './downloadStore/initialState';
import { DownloadStore } from './downloadStore';
import { PersistentState, initialState as persistentInitialState } from './persistentStore/initialState';
import { PersistentUserStore } from './persistentStore';

export const loginAction = (user: User) => {
  PersistentUserStore.update((s) => {
    return {
      ...s,
      userData: user,
      status: 'loggedIn',
    };
  });
};

export const logoutAction = async () => {
  await deleteAllJSONFiles();
  await cleanMongo();

  PersistentUserStore.update(() => {
    return {
      ...persistentInitialState,
      status: 'shouldLogIn',
    };
  });
};

export const setStagingAction = (isStaging: boolean) => {
  PersistentUserStore.update((s) => {
    return {
      ...s,
      isStaging,
    };
  });
};

export const updateStructuresMeta = (currentPage: number, totalPages: number) => {
  PersistentUserStore.update((s) => {
    return {
      ...s,
      structuresDbMeta: { currentPage, totalPages },
    };
  });
};

export const updateAssignmentsMeta = (currentPage: number, totalPages: number) => {
  PersistentUserStore.update((s) => {
    return {
      ...s,
      assignmentsDbMeta: { currentPage, totalPages },
    };
  });
};

export async function clearInspectionsDataAction() {
  await deleteAllJSONFiles();
  await cleanMongo();

  DownloadStore.update(() => downloadInitialState);

  PersistentUserStore.update((s) => {
    return {
      ...s,
      ...pick(
        ['forms', 'ratings', 'ratingsDownloaded', 'assignmentsDbMeta', 'structuresDbMeta', 'lastUpdated'],
        persistentInitialState,
      ),
    };
  });
}

// FORM ACTIONS

interface FormCreationParams {
  form: Form;
  assignmentId: number;
  ratings: Record<string, Rating>;
  structure: Structure;
  coords: { latitude: number | null; longitude: number | null };
}

function createEmptyDraftForm({ form, assignmentId, structure, coords, ratings }: FormCreationParams) {
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
    assignmentId: assignmentId,
    formId: form.id,
    structureId: structure.id,
    started_at: null,
    ended_at: null,
    guid: uuidv4(),
    flagged: false,
    private: false,
    latitude: coords.latitude,
    longitude: coords.longitude,
    fields: fromPairs(fields.map((field) => [field.formFieldId, field])),
    isDirty: false,

    notes: form.notes,
    categories: fromPairs(form.categories.map((c) => [c.id, c.name])),
    privateInspection: form.private_inspection,
    locationPath: structure.location_path || structure.display_name,
  };

  return result;
}

function makeString() {
  return Math.random().toString(36).substring(7);
}

function createMockDraftForm(params: FormCreationParams) {
  const emptyDraftForm = createEmptyDraftForm(params);

  return {
    ...emptyDraftForm,
    started_at: Date.now(),
    isDirty: true,
    fields: mapValues((field) => {
      const rating = params.ratings[field.rating_id];

      const baseField = {
        ...field,
        comment: makeString(),
        photos: [],
      };

      switch (rating.rating_type_id) {
        case 1:
          return {
            ...baseField,
            selectedChoice: sample(rating.range_choices),
          } as ScoreField;

        case 6:
          return {
            ...baseField,
            number_choice: Math.floor(Math.random() * 100).toString(),
          } as NumberField;
        case 7:
          return {
            ...baseField,

            selectedChoice: sample(rating.range_choices),
          } as PointsField;
        case 8:
          return {
            ...baseField,
            list_choice_ids: [sample(rating.range_choices)?.id],
          } as SelectField;
        case 9:
          return {
            ...baseField,
            list_choice_ids: sampleSize(
              Math.floor(Math.random() * rating.range_choices.length) + 1,
              rating.range_choices,
            ).map((c) => c.id),
          } as SelectField;

        default:
          return baseField as TextField;
      }
    }, emptyDraftForm.fields),
  };
}

export const initFormDraftAction = (params: FormCreationParams) => {
  PersistentUserStore.update((s) => {
    if (!s.drafts[params.assignmentId]) {
      const createForm = config.MOCKS.FORM ? createMockDraftForm : createEmptyDraftForm;

      return set(`drafts.${params.assignmentId}`, createForm(params), s);
    }

    return s;
  });
};

export const updateDraftFieldsAction = (assignmentId: number, formValues: Record<string, DraftField>) => {
  PersistentUserStore.update((persistentState) => {
    return pipe([
      // set draft as dirty
      set(['drafts', assignmentId, 'isDirty'], true),
      // set started_at if not already set
      (s: PersistentState) =>
        s.drafts[assignmentId].started_at ? s : set(`drafts.${assignmentId}.started_at`, Date.now(), s),
      // set all of form's values to draft's fields but with comments as null if they are empty
      set(
        ['drafts', assignmentId, 'fields'],
        mapValues((field) => set('comment', field.comment || null, field), formValues),
      ),
    ])(persistentState) as PersistentState;
  });
};

export const updateDraftFormAction = <T>(assignmentId: number, fieldName: string, value: T) => {
  PersistentUserStore.update((persistentState) => {
    return pipe([
      set(['drafts', assignmentId, fieldName], value),
      // set draft as dirty
      set(['drafts', assignmentId, 'isDirty'], true),
      // set started_at if not already set
      (s: PersistentState) =>
        s.drafts[assignmentId].started_at ? s : set(`drafts.${assignmentId}.started_at`, Date.now(), s),
      // set all of form's values to draft's fields but with comments as null if they are empty
    ])(persistentState) as PersistentState;
  });
};

export const submitDraftAction = (assignmentId: number) => {
  PersistentUserStore.update((s) => {
    const uploadDraft = {
      ...s.drafts[assignmentId],
      ended_at: Date.now(),
    } as DraftFormUpload;

    return {
      ...s,
      drafts: omit([assignmentId.toString()], s.drafts),
      pendingUploads: s.pendingUploads.concat([
        {
          draft: uploadDraft,
          photoUploadUrls: {},
          submittedAt: null,
        },
      ]),
    };
  });
};
