import { Structure } from 'src/types';

export type SearchState = {
  searchInput: string;
  lastSearch: string;
  showResults: boolean;
  isLoading: boolean;
  results: Structure[];
};

export const initialState: SearchState = {
  searchInput: '',
  lastSearch: '',
  showResults: false,
  isLoading: false,
  results: [],
};
