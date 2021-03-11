import { useEffect, useState } from 'react';
import { map } from 'lodash/fp';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { selectMongoComplete } from 'src/pullstate/selectors';
import { Assignment, Form, Structure, User } from 'src/types';

import { assignmentsDb, structuresDb } from './mongodb';

interface InspectionData {
  parent: Structure | null;
  children: Structure[];
}

export const structures = {
  useGet(id: number | null, isMongoComplete: boolean): [Structure | null, boolean] {
    const [data, setData] = useState<Structure | null>(null);
    const [isLoading, setIsloading] = useState(true);

    useEffect(() => {
      let mounted = true;

      (async () => {
        if (isMongoComplete) {
          if (id) {
            await structuresDb.loadPromise;
            if (!mounted) {
              return;
            }
            setData((await structuresDb.get(id)) || null);
            if (!mounted) {
              return;
            }
          }
          setIsloading(false);
        }
      })();

      return () => {
        mounted = false;
      };
    }, [id, isMongoComplete]);

    return [data, isLoading];
  },

  useInspection(parentId: number | null, userData: User | null): [InspectionData, boolean, boolean] {
    const [data, setData] = useState<InspectionData>({ parent: null, children: [] });
    const [isLoading, setIsloading] = useState(true);
    const { initialized, isMongoComplete } = PersistentUserStore.useState((s) => ({
      initialized: s.initialized,
      isMongoComplete: selectMongoComplete(s),
    }));

    useEffect(() => {
      let mounted = true;

      (async () => {
        await structuresDb.loadPromise;
        if (initialized && isMongoComplete) {
          mounted && setIsloading(true);

          if (parentId) {
            const newData = {
              parent: (await structuresDb.get(parentId)) || null,
              children: await structuresDb.getChildren(parentId),
            };

            mounted && setData(newData);
          } else {
            const showChildren = !!userData?.settings.display_supervisory_structure_children;
            const supervisoryStructures = userData?.supervisory_structures || [];

            if (!showChildren) {
              const baseStructures = await structuresDb.getMultiple(map('id', supervisoryStructures));
              mounted &&
                setData({
                  parent: null,
                  children: baseStructures,
                });
            } else {
              const baseId = supervisoryStructures[0]?.id || null;
              const newData = {
                parent: (await structuresDb.get(baseId)) || null,
                children: await structuresDb.getChildren(baseId),
              };
              mounted && setData(newData);
            }
          }
        }
        mounted && initialized && setIsloading(false);
      })();

      return () => {
        mounted = false;
      };
    }, [
      parentId,
      isMongoComplete,
      initialized,
      userData?.supervisory_structures,
      userData?.settings.display_supervisory_structure_children,
    ]);

    return [data, isLoading, isMongoComplete];
  },
};

export const assignments = {
  useGetAssignments(id: number | null, forms: Record<string, Form>): [Assignment[], boolean] {
    const [data, setData] = useState<Assignment[]>([]);
    const [isLoading, setIsloading] = useState(true);

    useEffect(() => {
      let mounted = true;

      (async () => {
        if (id) {
          await assignmentsDb.loadPromise;
          if (mounted) {
            const result = await assignmentsDb.getAssignments(id);

            mounted &&
              setData(
                result.sort((a, b) => {
                  return forms[a.inspection_form_id].name.localeCompare(forms[b.inspection_form_id].name);
                }),
              );
          }
        }
        mounted && setIsloading(false);
      })();

      return () => {
        mounted = false;
      };
    }, [forms, id]);

    return [data, isLoading];
  },
};

export function useIsMongoLoaded() {
  const [data, setData] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await Promise.all([assignmentsDb.loadPromise, structuresDb.loadPromise]);
      mounted && setData(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return data;
}
