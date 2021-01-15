import { AxiosError, AxiosPromise, AxiosResponse } from 'axios';

export function catchTo<T, E>(promise: Promise<T>): Promise<[E, undefined] | [null, T]> {
  return promise
    .then((data): [null, T] => [null, data])
    .catch((err: E) => {
      return [err, undefined];
    });
}

export async function axiosCatchTo<T>(
  promise: AxiosPromise<T>,
): Promise<[AxiosError, undefined] | [null, AxiosResponse<T>]> {
  try {
    const response = await promise;
    return [null, response];
  } catch (err) {
    return [err as AxiosError, undefined];
  }
}
