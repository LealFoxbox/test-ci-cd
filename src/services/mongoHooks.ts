import { useEffect, useState } from 'react';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { selectMongoComplete } from 'src/pullstate/selectors';
import { Assignment, Form, Structure } from 'src/types';

import { assignmentsDb, structuresDb } from './mongodb';

interface InspectionData {
  parent: Structure | null;
  children: Structure[];
}

export const structures = {
  useGet(id: number | null): [Structure | null, boolean] {
    const [data, setData] = useState<Structure | null>(null);
    const [isLoading, setIsloading] = useState(true);
    const isMongoComplete = PersistentUserStore.useState(selectMongoComplete);

    useEffect(() => {
      (async () => {
        if (isMongoComplete) {
          if (id) {
            await structuresDb.loadPromise;
            setData((await structuresDb.get(id)) || null);
          }
          setIsloading(false);
        }
      })();
    }, [id, isMongoComplete]);

    return [data, isLoading];
  },

  useInspection(parentId: number | null): [InspectionData, boolean] {
    const [data, setData] = useState<InspectionData>({ parent: null, children: [] });
    const [isLoading, setIsloading] = useState(true);
    const isMongoComplete = PersistentUserStore.useState(selectMongoComplete);

    useEffect(() => {
      (async () => {
        await structuresDb.loadPromise;
        if (isMongoComplete) {
          if (parentId) {
            setData({
              parent: (await structuresDb.get(parentId)) || null,
              children: await structuresDb.getChildren(parentId),
            });
          } else {
            const children = await structuresDb.getBase();
            if (children.length > 1) {
              setData({
                parent: null,
                children,
              });
            } else {
              setData({
                parent: (await structuresDb.get(children[0].id)) || null,
                children: await structuresDb.getChildren(children[0].id),
              });
            }
          }

          setIsloading(false);
        }
      })();
    }, [parentId, isMongoComplete]);

    return [data, isLoading];
  },
};

export const assignments = {
  useGetAssignments(id: number | null, forms: Record<string, Form>): [Assignment[], boolean] {
    const [data, setData] = useState<Assignment[]>([]);
    const [isLoading, setIsloading] = useState(true);

    useEffect(() => {
      (async () => {
        if (id) {
          await assignmentsDb.loadPromise;
          const result = await assignmentsDb.getAssignments(id);

          setData(
            result.sort((a, b) => {
              return forms[a.inspection_form_id].name.localeCompare(forms[b.inspection_form_id].name);
            }),
          );
        }
        setIsloading(false);
      })();
    }, [forms, id]);

    return [data, isLoading];
  },
  /* useGetDistinctFormIds(): [number[], boolean, TriggerFn] {
    const [data, setData] = useState<number[]>([]);
    const [isLoading, setIsloading] = useState(true);
    const [trigger, triggerFn] = useTrigger();

    useEffect(() => {
      (async () => {
        await assignmentsDb.loadPromise;
        setData(await assignmentsDb.getDistinctFormIds());
        setIsloading(false);
      })();
    }, [trigger]);

    return [data, isLoading, triggerFn];
  }, */
};

export function useIsMongoLoaded() {
  const [data, setData] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      await Promise.all([assignmentsDb.loadPromise, structuresDb.loadPromise]);
      setData(true);
    })();
  }, []);

  return data;
}
