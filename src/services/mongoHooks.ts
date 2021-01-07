import { useEffect, useState } from 'react';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { Assignment, Structure } from 'src/types';
import { TriggerFn, useTrigger } from 'src/utils/useTrigger';

import { assignmentsDb, selectMongoComplete, structuresDb } from './mongodb';

export const structures = {
  useGet(id: number | null): [Structure | null, boolean, TriggerFn] {
    const [data, setData] = useState<Structure | null>(null);
    const [isLoading, setIsloading] = useState(true);
    const [trigger, triggerFn] = useTrigger();
    const isMongoComplete = PersistentUserStore.useState(selectMongoComplete);

    useEffect(() => {
      (async () => {
        if (isMongoComplete) {
          if (id) {
            setData(await structuresDb.get(id));
          }
          setIsloading(false);
        }
      })();
    }, [id, trigger, isMongoComplete]);

    return [data, isLoading, triggerFn];
  },

  useGetChildren(id: number | null): [Structure[], boolean, TriggerFn] {
    const [data, setData] = useState<Structure[]>([]);
    const [isLoading, setIsloading] = useState(true);
    const [trigger, triggerFn] = useTrigger();
    const isMongoComplete = PersistentUserStore.useState(selectMongoComplete);

    useEffect(() => {
      (async () => {
        if (isMongoComplete) {
          if (id) {
            setData(await structuresDb.getChildren(id));
          } else {
            setData(await structuresDb.getBase());
          }

          setIsloading(false);
        }
      })();
    }, [id, trigger, isMongoComplete]);

    return [data, isLoading, triggerFn];
  },
};

export const assignments = {
  useGetAssignments(id: number | null): [Assignment[], boolean, TriggerFn] {
    const [data, setData] = useState<Assignment[]>([]);
    const [isLoading, setIsloading] = useState(true);
    const [trigger, triggerFn] = useTrigger();

    useEffect(() => {
      (async () => {
        if (id) {
          setData(await assignmentsDb.getAssignments(id));
        }
        setIsloading(false);
      })();
    }, [id, trigger]);

    return [data, isLoading, triggerFn];
  },
};
