'use client';

import {
  onSnapshot,
  query,
  Query,
  QuerySnapshot,
  collection,
  DocumentData,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useCollection<T>(path: string | undefined) {
  const db = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !path) {
      setLoading(false);
      setData(null);
      return;
    }

    const collRef = collection(db, path);
    const unsubscribe = onSnapshot(
      collRef,
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
          path: collRef.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error(`Error fetching collection ${path}:`, error);
      }
    );

    return () => unsubscribe();
  }, [db, path]);

  return { data, loading };
}
