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
  supervisory_structures: Array<{
    id: number;
    active_children_count: number;
    ancestry: null;
    display_name: string;
    location_path: string;
    notes: null;
    parent_id: null;
    updated_at: string;
  }>;
}

export interface Assignment {
  id: number;
  inspection_form_id: number;
  structure_id: number;
  updated_at: string;
}

export interface Form {
  id: number;
  categories: Array<{ id: number }>;
  inspection_form_items: Array<{
    id: number;
    category_id: number | null;
    description: string | null;
    display_name: string;
    line_item_id: number;
    position: number;
    rating_id: number;
    weight: number;
  }>;
  name: string;
  notes: string | null;
  private_inspection: boolean;
  updated_at: string;

  // added by us
  lastDownloaded: number; // this is a stored Date.now()
}

export interface Ratings {
  id: number;
}

export interface Structure {
  id: number;
  updated_at: string | null;
  ancestry: string | null;
  notes: string | null;
  active_children_count: number;

  // missing from docs but present in api
  parent_id: number | null;
  display_name: string;
  location_path: string | null;

  // missing from endpoint
  job_number?: string | null;
  structure_id?: number;
  structure_path?: string[];
  account_id?: number;
  name?: string;
  deleted_at?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
}
