export type Modify<T, R> = Omit<T, keyof R> & R;

export interface Category {
  id: number;
  name: string;
}

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
  categories: Category[];
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

export interface BaseRating {
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
    range_choices: SelectRatingChoice[];

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
  fileName: string;
  latitude: number | null; // Latitude where the inspection was started or first available location coordinates
  longitude: number | null; // Longitude where the inspection was started or first available location coordinates
  created_at: number; // timestamp in format "2020-01-08T14:52:56-07:00",
}

interface BaseField {
  name: string;
  deleted: boolean;

  rating_id: number;
  formFieldId: number;
  weight: number; // Reference to the inspection_form_item.weight.
  position: number; // Reference to the inspection_form_item.position. This represents render order.
  description: string | null;
  category_id: number | null;
  comment: string | null; //  If the user adds a comment to a line item, then clients should send the comment as a string. Otherwise, set as null. Ratings of type Textfield will save their result to the comment field.

  photos: DraftPhoto[];
}

export interface ScoreField extends BaseField {
  ratingTypeId: 1;

  selectedChoice: RangeChoice | null;
  minPosition: number;
  maxPosition: number;
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

  selectedChoice: RangeChoice | null;
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
  started_at: number | null;
  ended_at: number | null;
  guid: string; // random unique token created in the frontend. It's basically `${Date.now()}${uniqueId('')}`
  isDirty: boolean;
  lastModified: number | null;
  notes: string | null;
  categories: Record<string, string>; // key is categoryId, values is the name
  privateInspection: boolean;
  locationPath: string;

  flagged: boolean; // if the user toggles the flagged button
  private: boolean; // if the user toggles the private button or if the originating inspection_form was private
  latitude: number | null;
  longitude: number | null;
  fields: Record<string, DraftField>; // formFieldId is the key
}

export interface DraftFormUpload extends DraftForm {
  ended_at: number;
}

export interface PendingUpload {
  draft: DraftFormUpload;
  photoUploadUrls: Record<string, string>; // key is the photo filename, value is the aws bucket photo url
  submittedAt: number | null;
}

export interface PresignedPhoto {
  url: string;
  'expires-at': string;
  'object-url': string;
  fields: {
    acl: string;
    key: string;
    policy: string;
    'x-amz-credential': string;
    'x-amz-algorithm': string;
    'x-amz-date': string;
    'x-amz-signature': string;
  };

  /*
  for example:
  {
    "url": "https://orangeqc-staging-attachments.s3.amazonaws.com",
    "expires-at": "2021-02-19T22:53:17Z",
    "object-url": "https://orangeqc-staging-attachments.s3.amazonaws.com/cache/2209/2021-02-18/f29927e1ef/test1.png",
    "fields": {
        "acl": "public-read",
        "key": "cache/2209/2021-02-18/f29927e1ef/test1.png",
        "policy": "eyJleHBpcmF0aW9uIjoiMjAyMS0wMi0xOVQyMjo1MzoxN1oiLCJjb25kaXRpb25zIjpbeyJidWNrZXQiOiJvcmFuZ2VxYy1zdGFnaW5nLWF0dGFjaG1lbnRzIn0seyJhY2wiOiJwdWJsaWMtcmVhZCJ9LFsiY29udGVudC1sZW5ndGgtcmFuZ2UiLDEsMTA0ODU3NjBdLHsia2V5IjoiY2FjaGUvMjIwOS8yMDIxLTAyLTE4L2YyOTkyN2UxZWYvdGVzdDEucG5nIn0seyJ4LWFtei1jcmVkZW50aWFsIjoiQUtJQVRJRjVVUzZIRjJEUzVLSEovMjAyMTAyMTgvdXMtZWFzdC0xL3MzL2F3czRfcmVxdWVzdCJ9LHsieC1hbXotYWxnb3JpdGhtIjoiQVdTNC1ITUFDLVNIQTI1NiJ9LHsieC1hbXotZGF0ZSI6IjIwMjEwMjE4VDIyNTMxN1oifV19",
        "x-amz-credential": "AKIATIF5US6HF2DS5KHJ/20210218/us-east-1/s3/aws4_request",
        "x-amz-algorithm": "AWS4-HMAC-SHA256",
        "x-amz-date": "20210218T225317Z",
        "x-amz-signature": "94a5f5efcdb8ea1d80c426a976628a6b4dacd843b45936a6519e5089eb33148f"
    }
  }
  */
}
