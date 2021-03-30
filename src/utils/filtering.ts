import { filter } from 'lodash/fp';

// Note: Sadly, ExcludesFalsy is necessary to tell TS that filter(Boolean) is filtering out all falsy values
// solution based on https://stackoverflow.com/questions/47632622/typescript-and-filter-boolean
type ExcludesFalsy = <T>(x: T | false | undefined | null | 0 | '') => x is T;

export const booleanFilter = filter((Boolean as any) as ExcludesFalsy);
