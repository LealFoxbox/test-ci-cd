import { isSecondsExpired } from 'src/utils/expiration';
import { Form } from 'src/types';

import { assignmentsDb } from '../mongodb';

import { PERCENTAGES } from './percentages';

const [start, end] = PERCENTAGES.forms;

export async function getMissingForms(forms: Record<string, Form>) {
  const distinctIds = await assignmentsDb.getDistinctFormIds();
  const hadMissingIds = distinctIds.some((id) => !forms[id]);

  if (hadMissingIds) {
    return distinctIds.filter((id) => !forms[id] || isSecondsExpired(forms[id].lastDownloaded));
  }

  return [];
}

export async function getNextFormDownload(forms: Record<string, Form>) {
  const distinctIds = await assignmentsDb.getDistinctFormIds();
  const index = distinctIds.sort((a, b) => a - b).findIndex((id) => !forms[id]);

  if (index !== -1) {
    return {
      progress: start + ((end - start) * (index + 1)) / distinctIds.length,
      formId: distinctIds[index],
    };
  }

  return null;
}
