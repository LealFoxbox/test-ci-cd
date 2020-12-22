import axios from 'axios';

import config from 'src/config';
import { getApiUrl } from 'src/services/api/utils';

import { authenticate, fetchtUser } from '../user';

describe('api', () => {
  it('fetchtUser successfully fetches', async () => {
    const companyId = 'aaa';
    await fetchtUser({
      token: 'token',
      companyId,
    });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'get',
        url: `${getApiUrl(companyId)}/authenticate`,
        params: {
          user_credentials: 'token',
          device_guid: config.DEVICE_ID,
          app_version: `${config.PLATFORM}-${config.APP_VERSION}`,
        },
        headers: {
          Accept: 'application/json',
          'cache-control': 'no-cache',
        },
      }),
    );
  });

  it('authenticate successfully posts', async () => {
    const companyId = 'aaa';
    await authenticate({
      username: 'username',
      password: 'password',
      companyId,
    });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post',
        url: `${getApiUrl(companyId)}/authenticate`,
        data: {
          user_session: {
            login: 'username',
            password: 'password',
          },
          device_guid: config.DEVICE_ID,
          app_version: `${config.PLATFORM}-${config.APP_VERSION}`,
          device_name: config.MODEL,
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }),
    );
  });
});
