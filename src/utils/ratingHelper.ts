import { Rating } from 'src/types';

export function isPercentageRating(rating: Rating) {
  return rating.rating_type_id === 1;
}

export function isTextfieldRating(rating: Rating) {
  return rating.rating_type_id === 3;
}

export function isSignatureRating(rating: Rating) {
  return rating.rating_type_id === 5;
}

export function isNumberRating(rating: Rating) {
  return rating.rating_type_id === 6;
}

export function isPointsRating(rating: Rating) {
  return rating.rating_type_id === 7;
}

export function isSelectRating(rating: Rating) {
  return rating.rating_type_id === 8 || rating.rating_type_id === 9;
}

export function isSingleSelectRating(rating: Rating) {
  return rating.rating_type_id === 8;
}

export function isMultipleSelectRating(rating: Rating) {
  return rating.rating_type_id === 9;
}
