/* eslint-disable no-console */
import { MutableRefObject, useEffect, useRef } from 'react';
import { isEmpty } from 'lodash/fp';

import { DownloadStore } from 'src/pullstate/downloadStore';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { LoginStore } from 'src/pullstate/loginStore';
import { selectMongoComplete } from 'src/pullstate/selectors';
import timeoutPromise from 'src/utils/timeoutPromise';
import { useTrigger } from 'src/utils/useTrigger';
import { hasConnection, useNetworkStatus } from 'src/utils/useNetworkStatus';
import { getUnixSeconds, isSecondsExpired } from 'src/utils/expiration';
import { Form, SelectRating } from 'src/types';

import { fetchForm } from '../api/forms';
import { fetchRatingChoices, fetchRatings } from '../api/ratings';
import { assignmentsDb } from '../mongodb';
import { useIsMongoLoaded } from '../mongoHooks';

import { downloadByTypeAsPromise, waitForExistingDownloads } from './backDownloads';
import { DbTotalPages, getNextDbDownload, refreshDb, updateDBTotalPages } from './dbUtils';
import { deleteAllJSONFiles, deleteInvalidFiles } from './fileUtils';
import {
  cleanExpiredIncompleteRatings,
  getNextRatingChoicesDownload,
  isSelectRating,
  selectIsRatingsBaseDownloaded,
  selectIsRatingsComplete,
} from './ratingsUtils';
import { PERCENTAGES } from './percentages';

const FLAGS = {
  loggedIn: false,
};

function setProgress(progress: number) {
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

async function getMissingForms(forms: Record<string, Form>) {
  const distinctIds = await assignmentsDb.getDistinctFormIds();
  const hadMissingIds = distinctIds.some((id) => !forms[id]);

  if (hadMissingIds) {
    return distinctIds.filter((id) => !forms[id] || isSecondsExpired(forms[id].lastDownloaded));
  }

  return [];
}

export async function dbDownload({
  token,
  subdomain,
  totalPages,
  isStaging,
}: {
  token: string;
  subdomain: string;
  totalPages: MutableRefObject<DbTotalPages>;
  isStaging: boolean;
}) {
  console.log('DOWNLOADING STRUCTURES AND ASSIGNMENTS');
  setDownloading('db');
  await waitForExistingDownloads();
  // TODO: if a page was outdated, wouldn't that mean we'd need to redownload EVERYTHING?
  await deleteInvalidFiles();
  await updateDBTotalPages(totalPages, 'structures');
  await updateDBTotalPages(totalPages, 'assignments');

  let nextDownload = await getNextDbDownload(totalPages);
  let erroredOut = false;

  while (nextDownload && FLAGS.loggedIn && !erroredOut) {
    if (nextDownload) {
      setProgress(nextDownload.progress);
    }

    try {
      await downloadByTypeAsPromise({ token, subdomain, page: nextDownload.page, type: nextDownload.type });
      await timeoutPromise(200);

      if (!totalPages.current[nextDownload.type]) {
        await updateDBTotalPages(totalPages, nextDownload.type);
      }
      nextDownload = await getNextDbDownload(totalPages);
    } catch (e) {
      console.warn(nextDownload?.type, ' error on page ', nextDownload?.page, ' with: ', e);
      erroredOut = true;
    }
  }

  if (!erroredOut) {
    setProgress(PERCENTAGES.dbLoad[0]);

    FLAGS.loggedIn && (await refreshDb(isStaging));

    setProgress((PERCENTAGES.dbLoad[0] + PERCENTAGES.dbLoad[1]) * 0.5);

    await deleteAllJSONFiles();

    setProgress(PERCENTAGES.dbLoad[1]);

    setDownloading(null);
  } else {
    console.warn('DB DOWNLOAD ERRORED OUT');
    DownloadStore.update((s) => {
      s.error = `Failed to download Inspections data`;
      s.downloading = null;
    });
  }
}

async function formsDownload(formIds: number[], token: string, subdomain: string) {
  console.log('DOWNLOADING FORMS');
  setDownloading('forms');

  const [start, end] = PERCENTAGES.forms;
  let errorsCount = 0;
  let isConnected = true;

  let i = 0;
  while (i < formIds.length && FLAGS.loggedIn && errorsCount < 3 && isConnected) {
    const formId = formIds[i];
    try {
      console.log('fetchForms: form ', i + 1, ' out of ', formIds.length);

      const { data } = await fetchForm({ companyId: subdomain, token, formId });
      errorsCount = 0;
      PersistentUserStore.update((s) => {
        s.forms[data.inspection_form.id] = {
          ...data.inspection_form,
          lastDownloaded: getUnixSeconds(),
        };
        s.lastUpdated = Date.now();
      });
      setProgress(start + ((end - start) * i) / formIds.length);

      i += 1;
    } catch (e) {
      errorsCount += 1;
      // we probably don't have any internet, let's check that
      isConnected = await hasConnection();
    }

    await timeoutPromise(200);
  }

  if (isConnected) {
    if (errorsCount >= 3) {
      DownloadStore.update((s) => {
        s.error = `Failed to download form data`;
      });
    } else {
      setProgress(end);
    }
  }

  setDownloading(null);
}

async function enhancedTryCatch(cb: () => Promise<void>) {
  let errorsCount = 0;
  let success = false;
  let isConnected = true;

  while (!success && errorsCount < 3 && isConnected && FLAGS.loggedIn) {
    try {
      await cb();
      success = true;
    } catch (e) {
      errorsCount += 1;
      // we probably don't have any internet, let's check that
      isConnected = await hasConnection();
    }
  }

  if (!success && isConnected) {
    return true;
  }

  return false;
}

async function ratingsDownload(token: string, subdomain: string) {
  setDownloading('ratings');
  console.log('DOWNLOADING RATINGS');

  const [start, end] = PERCENTAGES.ratings;

  setProgress(start);
  const erroredOut = await enhancedTryCatch(async () => {
    const { data } = await fetchRatings({ companyId: subdomain, token });

    PersistentUserStore.update((s) => {
      for (const key of Object.keys(s.ratings)) {
        delete s.ratings[key];
      }

      for (const r of data.ratings) {
        if (!isSelectRating(r)) {
          s.ratings[r.id] = r;
        } else {
          (s.ratings[r.id] as any) = {
            ...r,
            page: null,
            totalPages: null,
            lastDownloaded: [],
          };
        }
      }
      const now = Date.now();
      s.ratingsDownloaded = now;
      s.lastUpdated = now;
    });

    setProgress(end);
  });

  if (erroredOut) {
    DownloadStore.update((s) => {
      s.error = `Failed to download ratings data`;
    });
  }

  setDownloading(null);
}

async function ratingChoicesDownload(token: string, subdomain: string) {
  setDownloading('ratingChoices');
  console.log('DOWNLOADING RATING CHOICES');

  cleanExpiredIncompleteRatings();

  const [, end] = PERCENTAGES.ratingChoices;

  let nextDownload = getNextRatingChoicesDownload();
  let erroredOut = false;

  while (nextDownload && !erroredOut) {
    erroredOut = await enhancedTryCatch(async () => {
      if (nextDownload) {
        console.log(
          'ratingChoicesDownload: ratingsChoice #',
          nextDownload.ratingId,
          ' -> ',
          nextDownload.page,
          ' out of ',
          nextDownload.totalPages,
        );

        const { data } = await fetchRatingChoices({
          companyId: subdomain,
          token,
          ratingId: nextDownload.ratingId,
          page: nextDownload.page,
        });

        PersistentUserStore.update((s) => {
          if (nextDownload) {
            const id = nextDownload.ratingId;
            // TODO: investigate a way to remove the type casting

            (s.ratings[id] as any) = {
              ...s.ratings[id],
              range_choices: ((s.ratings[id] as SelectRating)?.range_choices || []).concat(data.list_choices),
              lastDownloaded: ((s.ratings[id] as SelectRating)?.lastDownloaded || []).concat(Date.now()),
              page: data.meta.current_page,
              totalPages: data.meta.total_pages,
            };

            s.lastUpdated = Date.now();
          }
        });

        setProgress(nextDownload.progress);

        nextDownload = getNextRatingChoicesDownload();
      }
    });

    await timeoutPromise(200);
  }

  if (erroredOut) {
    DownloadStore.update((s) => {
      s.error = `Failed to download rating choices data`;
    });
  } else {
    setProgress(end);
  }

  setDownloading(null);
}

export function useDownloader(): ReturnType<typeof useTrigger> {
  const [shouldTrigger, setShouldTrigger] = useTrigger();
  const { token, inspectionsEnabled, subdomain, isStaging } = LoginStore.useState((s) => ({
    token: s.userData?.single_access_token,
    inspectionsEnabled: s.userData?.features.inspection_feature.enabled,
    subdomain: s.userData?.account.subdomain,
    isStaging: s.isStaging,
  }));
  const { forms, ratings, isRatingsBaseDownloaded, isRatingsComplete, isMongoComplete } = PersistentUserStore.useState(
    (s) => ({
      forms: s.forms,
      ratings: s.ratings,
      isRatingsBaseDownloaded: selectIsRatingsBaseDownloaded(s),
      isRatingsComplete: selectIsRatingsComplete(s),
      isMongoComplete: selectMongoComplete(s),
    }),
  );
  const { downloading, downloadError } = DownloadStore.useState((s) => ({
    downloading: s.downloading,
    downloadError: s.error,
  }));
  const isMongoLoaded = useIsMongoLoaded();
  const connected = useNetworkStatus();

  const totalPages = useRef<DbTotalPages>({
    structures: null,
    assignments: null,
  });

  useEffect(() => {
    (async () => {
      if (!token) {
        FLAGS.loggedIn = false;
      } else if (isMongoLoaded && shouldTrigger && subdomain) {
        FLAGS.loggedIn = true;
        if (inspectionsEnabled && !downloadError && downloading === null) {
          if (!isMongoComplete) {
            void dbDownload({ token, subdomain, totalPages, isStaging });
          } else {
            DownloadStore.update((s) => {
              if (s.progress < PERCENTAGES.forms[0]) {
                s.progress = PERCENTAGES.forms[0];
              }
            });
            const formIds = await getMissingForms(forms);
            if (formIds.length > 0) {
              void formsDownload(formIds, token, subdomain);
            } else {
              if (!isEmpty(forms)) {
                if (!isRatingsBaseDownloaded) {
                  void ratingsDownload(token, subdomain);
                } else if (!isRatingsComplete) {
                  void ratingChoicesDownload(token, subdomain);
                } else {
                  setProgress(100);
                }
              }
            }
          }
        }
      }
    })();
  }, [
    isMongoLoaded,
    shouldTrigger,
    token,
    subdomain,
    forms,
    ratings,
    isMongoComplete,
    downloading,
    inspectionsEnabled,
    downloadError,
    connected,
    isRatingsComplete,
    isRatingsBaseDownloaded,
    isStaging,
  ]);

  return [shouldTrigger, setShouldTrigger];
}
