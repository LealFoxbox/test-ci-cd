import { DraftField, NumberField } from 'src/types';

export function isCorrectNumberCard(number?: string) {
  return number ? /^\d*\.?\d*$/.test(number) : true;
}

function validateNumberChoices(values: NumberField) {
  const valuesNumberChoice = Object.values(values).filter(({ ratingTypeId, number_choice }) => {
    return ratingTypeId === 6 && !!number_choice;
  });
  return valuesNumberChoice.every((value) => isCorrectNumberCard(value.number_choice));
}

export function validateFormScreen(values: Record<string, DraftField>) {
  return validateNumberChoices((values as unknown) as NumberField);
}
