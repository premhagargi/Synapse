'use client';

import {
  onSnapshot,
  Query,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useCollectionQuery<T>(query: Query<DocumentData> | undefined) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      setData(null);
      return;
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const data: T[] = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as T[];
        setData(data);
        setLoading(false);
      },
      async (error) => {
        setLoading(false);
        const permissionError = new FirestorePermissionError({
          path: 'collection query', // This is a limitation, we don't know the exact path from a query
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error(`Error fetching collection query:`, error);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading };
}
