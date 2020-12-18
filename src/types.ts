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
    };
    ticket_feature: {
      enabled: boolean;
      url: string;
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
    max_line_item_photo_attachments: number;
    max_attachments_per_ticket: number;
    display_supervisory_structure_children: boolean;
  };
  single_access_token: string;
}

export interface Assignments {
  id: number;
  inspection_form_id: number;
  structure_id: number;
  updated_at: string;
}

export interface Form {
  id: number;
}

export interface Ratings {
  id: number;
}

export interface Structure {
  id: number;
  updated_at: string | null;
  ancestry: string | null;
  notes: string;
  active_children_count: number;
  // missing from endpoint
  job_number: string | null;
  structure_id: number;
  structure_path: string[];
  account_id: number;
  name: string;
  deleted_at: string | null;
  started_at: string | null;
  ended_at: string | null;
}
