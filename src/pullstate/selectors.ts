import { PersistentState } from './persistentStore/initialState';

export function selectMongoComplete(s: PersistentState) {
  return (
    !!s.structuresFilesLoaded &&
    s.structuresFilesLoaded === s.structuresTotalPages &&
    !!s.assignmentsFilesLoaded &&
    s.assignmentsFilesLoaded === s.assignmentsTotalPages
  );
}
