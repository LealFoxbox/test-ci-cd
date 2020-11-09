export function catchTo<T>(promise: Promise<T>): Promise<[unknown, undefined] | [null, T]> {
  return promise
    .then((data): [null, T] => [null, data])
    .catch((err: unknown) => {
      return [err, undefined];
    });
}
