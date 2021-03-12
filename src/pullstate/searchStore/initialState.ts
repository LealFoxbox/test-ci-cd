import { Structure } from 'src/types';

export type SearchState = {
  showResults: boolean;
  results: Structure[];
};

export const initialState: SearchState = {
  showResults: false,
  results: [],
};
