import { isEmpty, sortBy } from 'lodash/fp';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { PersistentState } from 'src/pullstate/persistentStore/initialState';
import { Rating, SelectRating } from 'src/types';
import { isMilisecondsExpired } from 'src/utils/expiration';
import { isSelectRating } from 'src/utils/ratingHelper';

import { PERCENTAGES } from './percentages';

export const isRatingExpired = (selectRating: SelectRating) => {
  return Object.values(selectRating.lastDownloaded).some(isMilisecondsExpired);
};

export const isRatingComplete = (selectRating: SelectRating) => {
  return selectRating.page !== null && selectRating.page === selectRating.totalPages && !isRatingExpired(selectRating);
};

export function getSelectRatings(ratings: Record<string, Rating>) {
  return Object.values(ratings).filter((r) => isSelectRating(r)) as SelectRating[];
}

export const selectIsRatingsBaseDownloaded = (s: PersistentState) => {
  return !isEmpty(s.ratings) && s.ratingsDownloaded !== null && !isMilisecondsExpired(s.ratingsDownloaded);
};

export const selectIsRatingsComplete = (s: PersistentState) =>
  selectIsRatingsBaseDownloaded(s) &&
  Object.values(s.ratings).reduce((acc, curr) => {
    if (!acc) {
      return false;
    }

    if (!isSelectRating(curr)) {
      return true;
    }

    return isRatingComplete(curr as SelectRating);
  }, true);

export function cleanExpiredIncompleteRatings() {
  PersistentUserStore.update((s) => {
    const selectRatings = getSelectRatings(s.ratings);

    selectRatings.forEach((r) => {
      if (isRatingExpired(r) && r.page !== null && r.page !== r.totalPages) {
        s.ratings[r.id].range_choices = [];
        (s.ratings[r.id] as SelectRating).page = null;
        (s.ratings[r.id] as SelectRating).totalPages = null;
        (s.ratings[r.id] as SelectRating).lastDownloaded = [];
      }
    });
  });
}

export function getNextRatingChoicesDownload() {
  const selectRatings = sortBy('id', getSelectRatings(PersistentUserStore.getRawState().ratings));
  const [start, end] = PERCENTAGES.ratings;

  const i = selectRatings.findIndex((r) => !isRatingComplete(r));

  if (i !== -1) {
    const r = selectRatings[i];
    const page = r.page ? r.page + 1 : 1;

    const chunk = (end - start) / selectRatings.length;
    const progress = !r.totalPages ? start + chunk * i + page * 2 : start + chunk * i + (chunk * page) / r.totalPages;

    return {
      progress,
      ratingId: r.id,
      page,
      totalPages: r.totalPages,
    };
  }

  return null;
}
