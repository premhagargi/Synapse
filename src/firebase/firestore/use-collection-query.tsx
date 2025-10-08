'use client';

import {
  onSnapshot,
  Query,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, FirestoreIndexError } from '@/firebase/errors';

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

        // Handle different types of Firebase errors
        if (error instanceof FirebaseError) {
          if (error.code === 'permission-denied') {
            // This is a genuine permission error
            const permissionError = new FirestorePermissionError({
              path: 'collection query',
              operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
          } else if (error.code === 'failed-precondition' && error.message.includes('requires an index')) {
            // This is an index error - the query requires a composite index
            const indexUrl = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0];
            const indexError = new FirestoreIndexError(error.message, indexUrl);
            errorEmitter.emit('index-error', indexError);
            console.error(`Firestore Index Error: ${error.message}`);
            console.error('Create the required index at:', indexUrl);
          } else {
            // Other Firebase errors
            console.error(`Firestore Error (${error.code}):`, error.message);
          }
        } else {
          // Non-Firebase errors
          console.error('Error fetching collection query:', error);
        }
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading };
}
