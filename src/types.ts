export type Modify<T, R> = Omit<T, keyof R> & R;

export interface Assignment {
  id: number;
  inspection_form_id: number;
  structure_id: number;
  updated_at: string;
}

export interface FormItem {
  id: number;
  category_id: number | null;
  description: string | null;
  display_name: string;
  line_item_id: number;
  position: number;
  rating_id: number;
  weight: number;
}

export interface Form {
  id: number;
  categories: Array<{ id: number }>;
  inspection_form_items: FormItem[];
  name: string;
  notes: string | null;
  private_inspection: boolean;
  updated_at: string;

  // added by us
  lastDownloaded: number; // this is a stored Date.now()
}

export interface Structure {
  id: number;
  updated_at: string | null;
  ancestry: string | null;
  notes: string | null;
  active_children_count: number;
  parent_id: number | null;
  display_name: string;
  location_path: string | null;
}

export interface User {
  id: number;
  account: {
    id: number;
    name: string;
    subdomain: string;
  };
  email: string;
  features: {
    inspection_feature: {
      enabled: boolean;
      url: string;
      private_inspections_enabled: boolean;
    };
    ticket_feature: {
      enabled: boolean;
      url: string;
      can_view_inspections: boolean;
      private_tickets_enabled: boolean;
      can_edit_status: boolean;
      can_edit_due_dates: boolean;
      can_edit_assignees: boolean;
    };
    schedule_feature: {
      enabled: boolean;
      url: string;
    };
  };
  first_name: string;
  last_name: string;
  login: string;
  settings: {
    max_attachments_per_inspection: number;
    max_attachments_per_ticket: number;
    display_supervisory_structure_children: boolean;
  };
  single_access_token: string;
  supervisory_structures: Structure[];
}

/////// RATING CHOICES ///////////

export interface RangeChoice {
  id: number;
  default: boolean;
  deficient: boolean;
  label: string;
  points: number | null;
  position: number;
  score: string | null; // number between 0 and 1
}

export interface SelectRatingChoice {
  id: number;
  name: string;
  position: number;
}

/////// RATING TYPES ///////////

interface BaseRating {
  id: number;
  name: string;
  prefix: null;
  suffix: null;
  range_choices: [];
}

export type ScoreRating = Modify<
  BaseRating,
  {
    rating_type_id: 1;
    range_choices: RangeChoice[];
  }
>;

export interface TextfieldRating extends BaseRating {
  rating_type_id: 3;
}

export interface SignatureRating extends BaseRating {
  rating_type_id: 5;
}

export type NumberRating = Modify<
  BaseRating,
  {
    rating_type_id: 6;
    prefix: string | null;
    suffix: string | null;
  }
>;

export type PointsRating = Modify<
  BaseRating,
  {
    rating_type_id: 7;
    range_choices: RangeChoice[];
  }
>;

export type SelectRating = Modify<
  BaseRating,
  {
    rating_type_id: 8 | 9; // 8 is a simple select, 9 is for multi-select
    range_choices: SelectRatingChoice[]; // TODO: this needs to be filled in by the backend separately

    // added by us
    page: number | null;
    totalPages: number | null;
    lastDownloaded: number[];
  }
>;

export type Rating = ScoreRating | TextfieldRating | SignatureRating | NumberRating | PointsRating | SelectRating;

/////// FORM EDITING TYPES ///////////

export interface DraftPhoto {
  isFromGallery: boolean;
  uri: string;
  latitude: number | null; // Latitude where the inspection was started or first available location coordinates
  longitude: number | null; // Longitude where the inspection was started or first available location coordinates
  created_at: number; // timestamp in format "2020-01-08T14:52:56-07:00",
}

interface BaseField {
  name: string;

  rating_id: number;
  formFieldId: number;
  weight: number; // Reference to the inspection_form_item.weight.
  position: number; // Reference to the inspection_form_item.position. This represents render order.
  description: string | null;
  category_id: number | null;
  comment: string | null; //  If the user adds a comment to a line item, then clients should send the comment as a string. Otherwise, set as null. Ratings of type Textfield will save their result to the comment field.

  photos: DraftPhoto[]; // maybe it's not common? examples say it is
}

export interface ScoreField extends BaseField {
  ratingTypeId: 1;

  range_choice_label: string | null; // The selected range_choice.label.
  range_choice_position: number | null; // Based upon the selected range_choice.deficient boolean. If the user selects a deficient=true range choice, then provide "true". Otherwise, set as "false".
  range_choice_max_position: number | null; // The max value of range_choices.position
  range_choice_min_position: number | null; // The minimum value of range_choices.position
  score: string | null; // The select range_choice.score. For example, '0.70'. Note that these are decimal values so 0.70 is what the client app should provide, not 70.
  deficient: boolean | null; // Based upon the selected range_choice.deficient boolean. If the user selects a deficient=true range choice, then provide "true". Otherwise, set as "false".
}

export interface TextField extends BaseField {
  ratingTypeId: 3;
}

export interface SignatureField extends BaseField {
  ratingTypeId: 5;
}

export interface NumberField extends BaseField {
  ratingTypeId: 6;

  number_choice: string | null; // Only provide a value if the user enters a number. Otherwise, client must provide a value of null. Only provide zero if the user explicitly entered 0.
}

export interface PointsField extends BaseField {
  ratingTypeId: 7;

  deficient: boolean | null; // Based upon the selected range_choice.deficient boolean. If the user selects a deficient=true range choice, then provide "true". Otherwise, set as "false".
  range_choice_label: string | null; // The selected range_choice.label.
  range_choice_position: number | null; // Based upon the selected range_choice.deficient boolean. If the user selects a deficient=true range choice, then provide "true". Otherwise, set as "false".
  points: number | null; // The select range_choice.points. For example, "4".
}

export interface SelectField extends BaseField {
  ratingTypeId: 8 | 9;

  list_choice_ids: number[]; // Only provide a value if the user makes a selection from the list picker. Please note that multiple choice list pickers could contain multiple integers in an array. A single choice list picker would contain an array of one integer. If no selection was made, client must provide null or empty array.
}

export type DraftField = ScoreField | TextField | SignatureField | NumberField | PointsField | SelectField;

export interface DraftForm {
  name: string;
  assignmentId: number;
  formId: number;
  structureId: number;
  started_at: number;
  ended_at: number | null;
  guid: string; // random unique token created in the frontend. It's basically `${Date.now()}${uniqueId('')}`
  isDirty: boolean;
  notes: string | null;
  categories: Array<{ id: number }>;
  privateInspection: boolean;

  flagged: boolean; // if the user toggles the flagged button
  private: boolean; // if the user toggles the private button or if the origating inspection_form was private
  latitude: number | null;
  longitude: number | null;
  fields: Record<string, DraftField>; // formFieldId is the key
}
