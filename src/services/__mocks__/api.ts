const response = {
  user: {
    account: {
      id: 1822,
      name: 'Mobile Test Account',
      subdomain: 'mobiletest',
    },
    email: 'minh@foxbox.com',
    features: {
      inspection_feature: {
        enabled: true,
        url: 'https://mobiletest.orangeqc-staging.com/inspect/areas?mobile_app=1',
      },
      schedule_feature: {
        enabled: true,
        url: 'https://mobiletest.orangeqc-staging.com/inspection_events?mobile_app=1',
      },
      ticket_feature: {
        enabled: true,
        url: 'https://mobiletest.orangeqc-staging.com/tickets?mobile_app=1',
      },
    },
    first_name: 'Foxbox',
    id: 32691,
    last_name: 'Digital',
    login: 'foxbox',
    settings: {
      display_supervisory_structure_children: true,
      max_attachments_per_inspection: 100,
      max_attachments_per_ticket: 10,
    },
    single_access_token: 'cLSCnWo7CUYM3JgGUYCN',
  },
};

export const authenticate = jest.fn().mockResolvedValue({ data: response, status: 200 });
export const fetchtUser = jest.fn().mockResolvedValue({ data: response, status: 200 });
