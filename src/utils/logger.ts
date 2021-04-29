import * as Sentry from '@sentry/react-native';

type Context = {
  [p: string]: unknown;
  severity?: Sentry.Severity;
  tags?: { [k: string]: string };
  errorInstance?: Error;
};

const DEFAULT_CONTEXT = 'custom information';

export function logErrorToSentry(description: string, context: Context = {}) {
  if (__DEV__) {
    console.log(description, context);
    return;
  }
  const scope = new Sentry.Scope();
  const { tags = {}, severity, ...contextData } = context;
  const messageWithErrorCode = `${description}`;

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

  if (Object.keys(tags).length) {
    scope.setTags(tags);
  }
  Sentry.captureMessage(messageWithErrorCode, scope);
}
