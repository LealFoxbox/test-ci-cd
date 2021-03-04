import { isEmpty, sortBy } from 'lodash/fp';

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
  return !isEmpty(s.ratings) && s.ratingsDownloaded !== null && !isMilisecondsExpired(s.ratingsDownloaded);
};

export const selectIsRatingsComplete = (s: PersistentState) => {
  if (isEmpty(s.ratings) || s.ratingsDownloaded === null) {
    return false;
  }

  return Object.values(s.ratings).every((curr) => !isSelectRating(curr) || isRatingComplete(curr as SelectRating));
};

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

  const i = selectRatings.findIndex((r) => !isRatingComplete(r) || isRatingExpired(r));

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
