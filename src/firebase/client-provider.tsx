'use client';

import {
  type Auth,
  getAuth,
} from 'firebase/auth';
import {
  type Firestore,
  getFirestore,
} from 'firebase/firestore';
import {
  FirebaseApp,
  initializeApp,
} from 'firebase/app';
import { ReactNode, useEffect, useState } from 'react';

import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from '@/firebase/config';

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

// Initializes and holds a single instance of the Firebase app.
const firebaseApp = initializeApp(firebaseConfig);

/**
 * A client-side component that initializes Firebase and provides it to all
 * children.
 *
 * This component ensures that Firebase is only initialized once on the client,
 * even with React strict mode. It also provides the Firebase app, auth, and
 * firestore instances to the FirebaseProvider.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [instances, setInstances] = useState<FirebaseInstances | null>(null);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);
    setInstances({ app: firebaseApp, auth, db });
  }, []);

  if (!instances) {
    // You can show a loading skeleton here if needed
    return null;
  }

  return (
    <FirebaseProvider
      app={instances.app}
      auth={instances.auth}
      db={instances.db}
    >
      {children}
    </FirebaseProvider>
  );
}
