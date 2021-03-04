import { AxiosError } from 'axios';
import * as rax from 'retry-axios';
import { getOr } from 'lodash/fp';

import { getApiUrl as getConfigApi } from 'src/config';
import { LoginStore } from 'src/pullstate/loginStore';

export type ApiError = AxiosError<{ message: string; error: string }>;

export function getApiUrl(companyId: string) {
  const isStaging = LoginStore.getRawState().isStaging;
  return `https://${companyId}.${getConfigApi(isStaging)}`;
}

export const baseRaxConfig: rax.RaxConfig['raxConfig'] = {
  retryDelay: 200,
  backoffType: 'exponential',
  shouldRetry: (err) => {
    const cfg = rax.getConfig(err);
    const currentRetryAttempt = getOr(0, 'currentRetryAttempt', cfg);
    const retry = getOr(4, 'retry', cfg);

    if (currentRetryAttempt <= retry) {
      return err.response?.status === 503;
    }
    return false;
  },
};

export const bigDownloadRaxConfig: rax.RaxConfig['raxConfig'] = {
  retryDelay: 1000,
  backoffType: 'exponential',
  shouldRetry: (err) => {
    const cfg = rax.getConfig(err);
    const currentRetryAttempt = getOr(0, 'currentRetryAttempt', cfg);
    const retry = getOr(1, 'retry', cfg);

    if (currentRetryAttempt <= retry) {
      return err.response?.status === 503;
    }
    return false;
  },
};
