import { PersistentState } from './persistentStore/initialState';

export function selectMongoComplete(s: PersistentState) {
  return (
    !!s.structuresDbMeta &&
    !!s.structuresDbMeta.currentPage &&
    s.structuresDbMeta.currentPage === s.structuresDbMeta.totalPages &&
    !!s.assignmentsDbMeta &&
    !!s.assignmentsDbMeta.currentPage &&
    s.assignmentsDbMeta.currentPage === s.assignmentsDbMeta.totalPages
  );
}
