import { useEffect, useReducer, useState } from 'react';
import { AxiosPromise } from 'axios';
import { set } from 'lodash/fp';

import { axiosCatchTo } from 'src/utils/catchTo';

export enum Status {
  IDLE,
  DOWNLOADING,
  DONE,
  ERRORED,
}

enum ActionType {
  ADD,
  START,
  FINISH,
  ERROR,
}

const dayInMs = 60 * 60 * 24;

export interface Job {
  download: () => AxiosPromise;
  doneTimeStamp: number | null;
  status: Status;
  payload: null | unknown;
  id: string;
}

export type JobMap = Record<string, Job>;

export interface IQueue {
  addJob: (job: Job) => void;
  triggerCheck: () => void;
  lastCheck: number;
  jobs: JobMap;
  isComplete: boolean;
}

type Action = {
  type: ActionType;
  job: Job;
  payload?: unknown;
};

const jobsReducer = (state: JobMap, action: Action): JobMap => {
  switch (action.type) {
    case ActionType.ADD: {
      return set(action.job.id, action.job, state);
    }

    case ActionType.START: {
      return set(`${action.job.id}.status`, Status.DOWNLOADING, state);
    }

    case ActionType.FINISH: {
      return set(action.job.id, { ...action.job, status: Status.DONE, payload: action.payload }, state);
    }

    case ActionType.ERROR: {
      return set(`${action.job.id}.status`, Status.ERRORED, state);
    }

    default:
      return state;
  }
};

const getNextJob = (jobs: JobMap) => {
  const jobList = Object.values(jobs);
  return (
    jobList.find((j) => j.status === Status.IDLE) ||
    jobList.find((j) => j.status === Status.ERRORED) ||
    jobList.find((j) => j.doneTimeStamp && Date.now() - j.doneTimeStamp > dayInMs)
  );
};

export const createJob = <T>(id: string, download: () => AxiosPromise<T>) => {
  return {
    id,
    download,
    doneTimeStamp: null,
    status: Status.IDLE,
    payload: null,
  };
};

// TODO: move this whole file onto pullstate persistent store

export const useDownloadQueue = (onComplete?: () => void): IQueue => {
  const [isComplete, setIsComplete] = useState(true);
  const [lastCheck, setLastCheck] = useState(Date.now());
  const [jobs, dispatch] = useReducer(jobsReducer, {} as JobMap);

  useEffect(() => {
    (async () => {
      const nextJob = getNextJob(jobs);

      if (nextJob) {
        setIsComplete(false);
        dispatch({ type: ActionType.START, job: nextJob });

        const [error, payload] = await axiosCatchTo(nextJob.download());
        if (!error) {
          dispatch({ type: ActionType.FINISH, job: nextJob, payload });
        } else {
          dispatch({ type: ActionType.ERROR, job: nextJob });
        }

        setLastCheck(Date.now());
      } else if (!isComplete) {
        setIsComplete(true);
        onComplete && onComplete();
      }
    })();
  }, [jobs, lastCheck, isComplete, onComplete]);

  return {
    addJob: (job: Job) => {
      dispatch({ type: ActionType.ADD, job });
    },
    triggerCheck: () => {
      setLastCheck(Date.now());
    },
    isComplete,
    lastCheck,
    jobs,
  };
};
