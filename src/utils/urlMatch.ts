import { URL, URLSearchParams } from 'react-native-url-polyfill';
import { fromPairs, zip } from 'lodash/fp';

function findIndexes<T>(list: T[], target: T) {
  return list.reduce((acc: number[], curr, index) => {
    if (curr === target) {
      return acc.concat([index]);
    }

    return acc;
  }, []);
}

export function urlMatch(url: string, expectedPath: string[], expectedQuery: Record<string, string>) {
  const urlObj = new URL(url);
  const path = urlObj.pathname.split('/').filter(Boolean);
  if (path.length !== expectedPath.length) {
    return false;
  }

  if (!zip(path, expectedPath).every(([a, b]) => b === '*' || a === b)) {
    return false;
  }

  const searchParams = new URLSearchParams(urlObj.search);

  const matches = Object.entries(expectedQuery).every(([key, value]) => {
    if (value === '*') {
      return !!searchParams.get(key);
    }
    return searchParams.get(key) === value;
  });

  if (matches) {
    return {
      pathValues: findIndexes(expectedPath, '*').map((i) => path[i]),
      searchValues: fromPairs(
        Object.entries(expectedQuery)
          .filter(([, value]) => value === '*')
          .map(([key]) => [key, searchParams.get(key)]),
      ),
    };
  }

  return false;
}
