import { defer, isEmpty, sortBy } from 'lodash/fp';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { PersistentState } from 'src/pullstate/persistentStore/initialState';
import { Rating, SelectRating } from 'src/types';
import { isMilisecondsExpired } from 'src/utils/expiration';

import { PERCENTAGES } from './percentages';

export function isSelectRating(rating: Rating | undefined) {
  return rating?.rating_type_id === 8 || rating?.rating_type_id === 9;
}

export const isRatingExpired = (selectRating: SelectRating) => {
  return Object.values(selectRating.lastDownloaded).some(isMilisecondsExpired);
};

export const isRatingComplete = (selectRating: SelectRating) => {
  return selectRating.page !== null && selectRating.page === selectRating.totalPages;
};

export function getSelectRatings(ratings: Record<string, Rating>) {
  return Object.values(ratings).filter((r) => isSelectRating(r)) as SelectRating[];
}

export const selectIsRatingsBaseDownloaded = (s: PersistentState) => {
  return !isEmpty(s.ratings) && s.ratingsDownloaded !== null;
};

export const selectRatingsComplete = (s: PersistentState) => {
  if (!selectIsRatingsBaseDownloaded(s)) {
    return false;
  }

  return getSelectRatings(s.ratings).every(isRatingComplete);
};

export function cleanExpiredIncompleteRatings() {
  return new Promise<boolean>((resolve) => {
    PersistentUserStore.update((s) => {
      const ratingBaseExpired = isMilisecondsExpired(s.ratingsDownloaded);

      if (ratingBaseExpired || getSelectRatings(s.ratings).some(isRatingExpired)) {
        defer(() => resolve(true));
        return {
          ...s,
          ratings: {},
          ratingsDownloaded: null,
        };
      }
      defer(() => resolve(false));
      return s;
    });
  });
}

export interface RatingChoicesDownload {
  progress: number;
  ratingId: number;
  page: number;
  totalPages: number | null;
}

export function getNextRatingChoicesDownload(ratings: Record<string, Rating>): RatingChoicesDownload | null {
  const selectRatings = sortBy('id', getSelectRatings(ratings));
  const i = selectRatings.findIndex((r) => !isRatingComplete(r));

  if (i === -1) {
    return null;
  }

  const [start, end] = PERCENTAGES.ratingChoices;
  const r = selectRatings[i];
  const page = r.page ? r.page + 1 : 1;
  const chunk = (end - start) / selectRatings.length;
  const minFakeProgress = Math.max(1, Math.min(chunk, (page * chunk) / 5));

  const progress = !r.totalPages
    ? start + chunk * i + minFakeProgress
    : start + chunk * i + (chunk * page) / r.totalPages;

  return {
    progress,
    ratingId: r.id,
    page,
    totalPages: r.totalPages, // only used for console.logging
  };
}
