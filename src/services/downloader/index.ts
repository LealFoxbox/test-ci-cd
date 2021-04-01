/* eslint-disable no-console */
import { useEffect } from 'react';
import { fromPairs, isEmpty } from 'lodash/fp';

import { DownloadStore } from 'src/pullstate/downloadStore';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { LoginStore } from 'src/pullstate/loginStore';
import { selectMongoComplete } from 'src/pullstate/selectors';
import timeoutPromise from 'src/utils/timeoutPromise';
import { useTrigger } from 'src/utils/useTrigger';
import { hasConnection } from 'src/utils/useNetworkStatus';
import { getUnixSeconds } from 'src/utils/expiration';
import { Rating, SelectRating } from 'src/types';
import { addFilesPaths, clearAllFilesPaths, clearFilePaths, updateTotalPages } from 'src/pullstate/actions';

import { fetchForm } from '../api/forms';
import { fetchRatingChoices, fetchRatings } from '../api/ratings';
import { useIsMongoLoaded } from '../mongoHooks';

import { downloadFile } from './backDownloads';
import { findTotalPages, getNextDbDownload, refreshDb } from './dbUtils';
import { areFilesExpired, deleteAllJSONFiles, deleteInvalidFiles } from './fileUtils';
import {
  RatingChoicesDownload,
  cleanExpiredIncompleteRatings,
  getNextRatingChoicesDownload,
  isSelectRating,
  selectIsRatingsBaseDownloaded,
  selectRatingsComplete,
} from './ratingsUtils';
import { PERCENTAGES } from './percentages';
import { getNextFormDownload } from './formUtils';

const FLAGS = {
  loggedIn: false,
  errors: 0,
};

function advanceProgress(progress: number) {
  FLAGS.errors = 0;

  DownloadStore.update((s) => {
    if (s.progress !== progress) {
      s.progress = progress;
    }
  });
}

function setDownloading(downloading: 'forms' | 'db' | 'ratings' | 'ratingChoices' | 'fileDelete' | null) {
  DownloadStore.update((s) => ({
    ...s,
    downloading,
  }));
}

export async function handleError(section: string, noPermission = false) {
  FLAGS.errors += 1;

  if (noPermission) {
    DownloadStore.update((s) => {
      s.error = `Failed to download. Permission denied.`;
      console.log(`handleError: ${s.error}`);
    });
  }
  if (FLAGS.errors > 3) {
    // we probably don't have any internet, let's check that
    const isConnected = await hasConnection();

    if (isConnected) {
      DownloadStore.update((s) => {
        s.error = `Failed to download ${section} data`;
        console.log(`handleError: ${s.error}`);
      });
    }
  }
}

async function checkTotalPages({
  structuresTotalPages,
  assignmentsTotalPages,
  structuresFiles,
  assignmentsFiles,
}: {
  structuresTotalPages: number;
  assignmentsTotalPages: number;
  structuresFiles: Record<string, string>;
  assignmentsFiles: Record<string, string>;
}) {
  const isStructuresUpdateable = !structuresTotalPages && !isEmpty(structuresFiles);
  const isAssignmentsUpdateable = !assignmentsTotalPages && !isEmpty(assignmentsFiles);

  const totalPages = {
    structuresTotalPages: !isStructuresUpdateable ? structuresTotalPages : (await findTotalPages(structuresFiles)) || 0,
    assignmentsTotalPages: !isAssignmentsUpdateable
      ? assignmentsTotalPages
      : (await findTotalPages(assignmentsFiles)) || 0,
  };

  if (isStructuresUpdateable || isAssignmentsUpdateable) {
    updateTotalPages(totalPages);
  }

  return totalPages;
}

export async function fileDownload({
  structuresFiles,
  assignmentsFiles,
  token,
  subdomain,
  structuresTotalPages,
  assignmentsTotalPages,
}: {
  structuresFiles: Record<string, string>;
  assignmentsFiles: Record<string, string>;
  token: string;
  subdomain: string;
  structuresTotalPages: number;
  assignmentsTotalPages: number;
}) {
  setDownloading('db');

  if (areFilesExpired(structuresFiles) || areFilesExpired(assignmentsFiles)) {
    // Some file has expired, lets delete everything and setDownloading(null)
    await deleteAllJSONFiles();
    clearAllFilesPaths('structures');
    clearAllFilesPaths('assignments');
    FLAGS.errors = 0;

    setDownloading(null);
    return;
  }

  const totalPages = await checkTotalPages({
    structuresTotalPages,
    assignmentsTotalPages,
    structuresFiles,
    assignmentsFiles,
  });

  const nextDownload = getNextDbDownload(structuresFiles, assignmentsFiles, totalPages);

  if (nextDownload) {
    // There is at least one file to download, lets download it and setDownloading(null)
    const { type, page } = nextDownload;

    try {
      const path = await downloadFile({ token, subdomain, page, type });
      addFilesPaths({ type, filePaths: path });

      advanceProgress(nextDownload.progress);

      await timeoutPromise(200);
    } catch (e) {
      await handleError('db');
    }

    setDownloading(null);
    return;
  }

  const invalidStructures = await deleteInvalidFiles(structuresFiles);
  const invalidAssignments = await deleteInvalidFiles(assignmentsFiles);
  if (invalidStructures.length > 0 || invalidAssignments.length > 0) {
    // There was at least one unreadable file, lets delete it and setDownloading(null)
    clearFilePaths([invalidStructures, invalidAssignments].flat());
    setDownloading(null);
    return;
  }

  // We have all of the files and they're readabale! lets load the db
  advanceProgress(PERCENTAGES.dbLoad[0]);

  FLAGS.loggedIn && (await refreshDb(structuresFiles, assignmentsFiles));

  advanceProgress(PERCENTAGES.dbLoad[1]);

  setDownloading(null);
}

async function fileDelete() {
  setDownloading('fileDelete');

  advanceProgress(PERCENTAGES.fileDelete[0]);

  await deleteAllJSONFiles();
  PersistentUserStore.update((s) => ({
    ...s,
    structuresFilePaths: {},
    assignmentsFilePaths: {},
  }));

  advanceProgress(PERCENTAGES.fileDelete[1]);

  setDownloading(null);
}

async function formsDownload(
  { progress, formId }: { progress: number; formId: number },
  token: string,
  subdomain: string,
) {
  setDownloading('forms');

  try {
    console.log(`formsDownload: Downloading form ${formId}`);
    const { data } = await fetchForm({ companyId: subdomain, token, formId });

    PersistentUserStore.update((s) => {
      s.forms[data.inspection_form.id] = {
        ...data.inspection_form,
        lastDownloaded: getUnixSeconds(),
      };
      s.lastUpdated = Date.now();
    });

    advanceProgress(progress);
  } catch (e) {
    await handleError('form');
  }

  await timeoutPromise(200);

  setDownloading(null);
}

async function ratingsDownload(token: string, subdomain: string) {
  setDownloading('ratings');
  console.log('DOWNLOADING RATINGS');

  const [, end] = PERCENTAGES.ratings;

  try {
    const { data } = await fetchRatings({ companyId: subdomain, token });

    PersistentUserStore.update((s) => {
      const ratingKeyValueList: [number, Rating][] = data.ratings.map((r) => {
        if (!isSelectRating(r)) {
          return [r.id, r];
        }

        return [
          r.id,
          {
            ...r,
            page: null,
            totalPages: null,
            lastDownloaded: [],
          },
        ];
      });

      const now = Date.now();

      return {
        ...s,
        ratings: fromPairs(ratingKeyValueList),
        ratingsDownloaded: now,
        lastUpdated: now,
      };
    });

    advanceProgress(end);
  } catch (e) {
    await handleError('rating');
  }

  await timeoutPromise(200);

  setDownloading(null);
}

async function ratingChoicesDownload(nextDownload: RatingChoicesDownload, token: string, subdomain: string) {
  setDownloading('ratingChoices');

  console.log(
    'ratingChoicesDownload: ratingsChoice #',
    nextDownload.ratingId,
    ' -> ',
    nextDownload.page,
    ' out of ',
    nextDownload.totalPages,
  );

  try {
    const { data } = await fetchRatingChoices({
      companyId: subdomain,
      token,
      ratingId: nextDownload.ratingId,
      page: nextDownload.page,
    });

    PersistentUserStore.update((s) => {
      if (nextDownload) {
        const id = nextDownload.ratingId;
        const rating = s.ratings[id] as SelectRating | undefined;

        if (!rating) {
          throw new Error(`ratingChoicesDownload error: rating id ${id} doesn't exist in ratings`);
        }

        return {
          ...s,
          ratings: {
            ...s.ratings,
            [id]: {
              ...rating,
              range_choices: (rating.range_choices || []).concat(data.list_choices),
              lastDownloaded: (rating.lastDownloaded || []).concat(Date.now()),
              page: data.meta.current_page,
              totalPages: data.meta.total_pages,
            },
          },
          lastUpdated: Date.now(),
        };
      }

      return s;
    });

    advanceProgress(nextDownload.progress);
  } catch (e) {
    await handleError('ratingChoices');
  }

  await timeoutPromise(200);

  setDownloading(null);
}

export function useDownloader(): ReturnType<typeof useTrigger> {
  const [shouldTrigger, setShouldTrigger, resetTrigger] = useTrigger();
  const { token, inspectionsEnabled, subdomain, outdatedUserData } = LoginStore.useState((s) => ({
    token: s.userData?.single_access_token,
    inspectionsEnabled: s.userData?.features.inspection_feature.enabled,
    subdomain: s.userData?.account.subdomain,
    outdatedUserData: s.outdatedUserData,
  }));
  const {
    forms,
    ratings,
    isRatingsBaseDownloaded,
    isRatingsComplete,
    isMongoComplete,
    structuresFiles,
    assignmentsFiles,
    structuresTotalPages,
    assignmentsTotalPages,
  } = PersistentUserStore.useState((s) => ({
    forms: s.forms,
    ratings: s.ratings,
    isRatingsBaseDownloaded: selectIsRatingsBaseDownloaded(s),
    isMongoComplete: selectMongoComplete(s),
    isRatingsComplete: selectRatingsComplete(s),
    structuresFiles: s.structuresFilePaths,
    assignmentsFiles: s.assignmentsFilePaths,
    structuresTotalPages: s.structuresTotalPages,
    assignmentsTotalPages: s.assignmentsTotalPages,
  }));
  const { downloading, downloadError } = DownloadStore.useState((s) => ({
    downloading: s.downloading,
    downloadError: s.error,
  }));
  const isMongoLoaded = useIsMongoLoaded();

  // TODO: refactor this useEffect into a "return early" organization so that it's more readable
  useEffect(() => {
    (async () => {
      if (!token) {
        if (FLAGS.loggedIn) {
          FLAGS.loggedIn = false;
          FLAGS.errors = 0;
          resetTrigger();
        }
      } else if (isMongoLoaded && shouldTrigger && subdomain && !outdatedUserData) {
        FLAGS.loggedIn = true;
        if (inspectionsEnabled && !downloadError && downloading === null) {
          if (!isMongoComplete) {
            void fileDownload({
              structuresFiles,
              assignmentsFiles,
              token,
              subdomain,
              structuresTotalPages,
              assignmentsTotalPages,
            });
          } else {
            if (!isEmpty(structuresFiles) || !isEmpty(assignmentsFiles)) {
              void fileDelete();
            } else {
              const nextForm = await getNextFormDownload(forms);

              if (nextForm) {
                void formsDownload(nextForm, token, subdomain);
              } else if (!isRatingsComplete) {
                const wasCleaned = await cleanExpiredIncompleteRatings();
                // if it WAS cleaned, this useEffect will trigger again so we don't want to continue
                if (!wasCleaned) {
                  if (!isRatingsBaseDownloaded) {
                    void ratingsDownload(token, subdomain);
                  } else {
                    const nextRatingChoicesDownload = getNextRatingChoicesDownload(ratings);

                    if (nextRatingChoicesDownload) {
                      void ratingChoicesDownload(nextRatingChoicesDownload, token, subdomain);
                    } else {
                      advanceProgress(100);
                    }
                  }
                }
              } else {
                advanceProgress(100);
              }
            }
          }
        }
      }
    })();
  }, [
    assignmentsFiles,
    assignmentsTotalPages,
    downloadError,
    downloading,
    forms,
    inspectionsEnabled,
    isMongoComplete,
    isMongoLoaded,
    isRatingsBaseDownloaded,
    isRatingsComplete,
    outdatedUserData,
    ratings,
    resetTrigger,
    shouldTrigger,
    structuresFiles,
    structuresTotalPages,
    subdomain,
    token,
  ]);

  return [shouldTrigger, setShouldTrigger, resetTrigger];
}
