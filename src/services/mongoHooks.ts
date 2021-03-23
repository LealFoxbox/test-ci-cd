import { useCallback, useEffect, useState } from 'react';
import { map } from 'lodash/fp';

import { useResultAsync } from 'src/utils/useResult';
import { Form, User } from 'src/types';

import { assignmentsDb, structuresDb } from './mongodb';

export const structures = {
  useGet(id: number | null, isMongoComplete: boolean) {
    const fn = useCallback(async () => {
      await structuresDb.loadPromise;
      return structuresDb.get(id);
    }, [id]);
    return useResultAsync(fn, isMongoComplete);
  },

  useInspection(parentId: number | null, userData: User | null, shouldQuery: boolean) {
    const supervisoryChildren = !!userData?.settings.display_supervisory_structure_children;
    const supervisoryStructures = userData?.supervisory_structures;

    const fn = useCallback(async () => {
      await structuresDb.loadPromise;

      if (parentId) {
        return {
          parent: (await structuresDb.get(parentId)) || null,
          children: await structuresDb.getChildren(parentId),
        };
      } else {
        const showChildren = supervisoryChildren;
        const s = supervisoryStructures || [];

        if (!showChildren) {
          const baseStructures = await structuresDb.getMultiple(map('id', s));
          return {
            parent: null,
            children: baseStructures,
          };
        } else {
          const baseId = s[0]?.id || null;
          return {
            parent: (await structuresDb.get(baseId)) || null,
            children: await structuresDb.getChildren(baseId),
          };
        }
      }
    }, [parentId, supervisoryChildren, supervisoryStructures]);

    const [data, isLoading] = useResultAsync(fn, shouldQuery);

    return [data || { parent: null, children: [] }, isLoading] as const;
  },
};

export const assignments = {
  useGetAssignments(id: number | null, forms: Record<string, Form>) {
    const fn = useCallback(async () => {
      const result = await assignmentsDb.getAssignments(id);

      return result.sort((a, b) => {
        return forms[a.inspection_form_id].name.localeCompare(forms[b.inspection_form_id].name);
      });
    }, [forms, id]);

    return useResultAsync(fn, !!id);
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
