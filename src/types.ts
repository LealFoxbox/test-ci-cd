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
