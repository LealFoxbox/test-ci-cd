/* eslint-disable no-console */
import { useEffect } from 'react';
import { fromPairs } from 'lodash/fp';

import { DownloadStore } from 'src/pullstate/downloadStore';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { LoginStore } from 'src/pullstate/loginStore';
import { selectMongoComplete } from 'src/pullstate/selectors';
import timeoutPromise from 'src/utils/timeoutPromise';
import { useTrigger } from 'src/utils/useTrigger';
import { hasConnection } from 'src/utils/useNetworkStatus';
import { getUnixSeconds } from 'src/utils/expiration';
import { Rating, SelectRating } from 'src/types';

import { fetchForm } from '../api/forms';
import { fetchRatingChoices, fetchRatings } from '../api/ratings';
import { useIsMongoLoaded } from '../mongoHooks';

import { downloadByTypeAsPromise, waitForExistingDownloads } from './backDownloads';
import { getNextDbDownload, getTotalPages, refreshDb } from './dbUtils';
import { deleteAllJSONFiles, deleteExpiredFiles, deleteInvalidFiles } from './fileUtils';
import {
  RatingChoicesDownload,
  cleanExpiredIncompleteRatings,
  getNextRatingChoicesDownload,
  isSelectRating,
  selectIsRatingsBaseDownloaded,
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

function setDownloading(downloading: 'forms' | 'db' | 'ratings' | 'ratingChoices' | null) {
  DownloadStore.update((s) => {
    s.downloading = downloading;
  });
}

async function handleError(section: string) {
  FLAGS.errors += 1;

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

export async function dbDownload({
  token,
  subdomain,
  isStaging,
}: {
  token: string;
  subdomain: string;
  isStaging: boolean;
}) {
  console.log('DOWNLOADING STRUCTURES AND ASSIGNMENTS');
  setDownloading('db');
  await waitForExistingDownloads();
  await deleteExpiredFiles();
  await deleteInvalidFiles();

  const totalPages = {
    structures: await getTotalPages('structures'),
    assignments: await getTotalPages('assignments'),
  };

  let nextDownload = await getNextDbDownload(totalPages);
  let erroredOut = false;

  while (nextDownload && FLAGS.loggedIn && !erroredOut) {
    advanceProgress(nextDownload.progress);

    const { type } = nextDownload;

    try {
      await downloadByTypeAsPromise({ token, subdomain, page: nextDownload.page, type });
      await timeoutPromise(200);

      if (!totalPages[type]) {
        totalPages[type] = await getTotalPages(type);
      }
    } catch (e) {
      console.warn(nextDownload.type, ' error on page ', nextDownload.page, ' with: ', e);
      erroredOut = true;
    }

    if (!erroredOut) {
      nextDownload = await getNextDbDownload(totalPages);
    }
  }

  if (!erroredOut) {
    advanceProgress(PERCENTAGES.dbLoad[0]);

    FLAGS.loggedIn && (await refreshDb(isStaging));

    advanceProgress((PERCENTAGES.dbLoad[0] + PERCENTAGES.dbLoad[1]) * 0.5);

    await deleteAllJSONFiles();

    advanceProgress(PERCENTAGES.dbLoad[1]);
  } else {
    await handleError('db');
  }

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
  const { token, inspectionsEnabled, subdomain, isStaging, outdatedUserData } = LoginStore.useState((s) => ({
    token: s.userData?.single_access_token,
    inspectionsEnabled: s.userData?.features.inspection_feature.enabled,
    subdomain: s.userData?.account.subdomain,
    isStaging: s.isStaging,
    outdatedUserData: s.outdatedUserData,
  }));
  const { forms, ratings, isRatingsBaseDownloaded, isMongoComplete } = PersistentUserStore.useState((s) => ({
    forms: s.forms,
    ratings: s.ratings,
    isRatingsBaseDownloaded: selectIsRatingsBaseDownloaded(s),
    isMongoComplete: selectMongoComplete(s),
  }));
  const { downloading, downloadError } = DownloadStore.useState((s) => ({
    downloading: s.downloading,
    downloadError: s.error,
  }));
  const isMongoLoaded = useIsMongoLoaded();

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
            // eslint-disable-next-line no-constant-condition
            if (true) {
              // FIRST TIME WE ARE TRYING TO DOWNLOAD DB
              FLAGS.errors = 0;
            }

            // TODO: db refactor, use getNextDbDownload outside dbDownload instead

            void dbDownload({ token, subdomain, isStaging });
          } else {
            DownloadStore.update((s) => {
              if (s.progress < PERCENTAGES.forms[0]) {
                s.progress = PERCENTAGES.forms[0];
              }
            });

            const nextForm = await getNextFormDownload(forms);

            if (nextForm) {
              void formsDownload(nextForm, token, subdomain);
            } else {
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
            }
          }
        }
      }
    })();
  }, [
    downloadError,
    downloading,
    forms,
    inspectionsEnabled,
    isMongoComplete,
    isMongoLoaded,
    isRatingsBaseDownloaded,
    isStaging,
    outdatedUserData,
    ratings,
    resetTrigger,
    shouldTrigger,
    subdomain,
    token,
  ]);

  return [shouldTrigger, setShouldTrigger, resetTrigger];
}
