import * as Sentry from '@sentry/react-native';

import config from 'src/config';
import { LoginStore } from 'src/pullstate/loginStore';

type Context = {
  [p: string]: unknown;
  severity?: Sentry.Severity;
  tags?: { [k: string]: string };
  errorInstance?: Error;
};
interface UserData {
  id: string;
  email: string;
  username: string;
}

const DEFAULT_CONTEXT = 'custom information';

function getUserData() {
  const sentryUser: UserData = { id: '', email: '', username: '' };
  const { userData } = LoginStore.getRawState();

  if (!userData?.id) {
    return null;
  } else {
    sentryUser.id = userData.id.toString();
    sentryUser.email = userData?.email ?? '';
    sentryUser.username = userData?.login ?? '';
  }

  return sentryUser;
}

export function logErrorToSentry(description: string, context: Context = {}) {
  try {
    if (config.isDev) {
      console.warn(description, context);
      return;
    }
    const scope = new Sentry.Scope();

    scope.setUser(getUserData());

    const { tags = {}, severity, ...contextData } = context;
    const messageWithErrorCode = `${description}`;
    const newTags = { ...tags };

    scope.setLevel(severity || Sentry.Severity.Error);
    const defaultContextData = {
      messageWithErrorCode,
    };

    const formattedContextData = Object.entries(contextData || {}).reduce(
      (total, data) => ({
        ...total,
        [data[0]]: data[1] instanceof String ? data[1] : JSON.stringify(data[1]),
      }),
      {},
    );

    scope.setContext(DEFAULT_CONTEXT, { ...defaultContextData, ...formattedContextData });

    if (Object.keys(newTags).length) {
      scope.setTags(newTags);
    }
    Sentry.captureMessage(messageWithErrorCode, scope);
  } catch (error) {
    console.warn('error', error);
    Sentry.captureMessage(error?.message || 'Error in logger');
  }
}
