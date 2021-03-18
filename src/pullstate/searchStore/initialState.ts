import { Structure } from 'src/types';

export type SearchState = {
  searchInput: string;
  showResults: boolean;
  isLoading: boolean;
  results: Structure[];
};

export const initialState: SearchState = {
  searchInput: '',
  showResults: false,
  isLoading: false,
  results: [],
};
