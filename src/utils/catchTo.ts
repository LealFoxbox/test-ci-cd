import { AxiosError, AxiosPromise, AxiosResponse } from 'axios';

export function catchTo<T, E>(fn: () => Promise<T>): Promise<[E, undefined] | [null, T]> {
  return fn()
    .then((data): [null, T] => [null, data])
    .catch((err: E) => {
      return [err, undefined];
    });
}

export async function axiosCatchTo<T>(
  fn: () => AxiosPromise<T>,
): Promise<[AxiosError, undefined] | [null, AxiosResponse<T>]> {
  try {
    const response = await fn();
    return [null, response];
  } catch (err) {
    return [err as AxiosError, undefined];
  }
}
