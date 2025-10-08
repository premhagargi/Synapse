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
  type FirebaseStorage,
  getStorage,
} from 'firebase/storage';
import {
  FirebaseApp,
  initializeApp,
} from 'firebase/app';
import { ReactNode, useEffect, useState } from 'react';

import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig, useEmulators } from '@/firebase/config';

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
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
    const storage = getStorage(firebaseApp);
    
    // Connect to emulators if in development mode
    if (useEmulators) {
      import('firebase/auth').then(({ connectAuthEmulator }) => {
        try {
          connectAuthEmulator(auth, 'http://localhost:9099');
        } catch (error) {
          // Emulator already connected or error connecting
          console.log('Auth emulator connection:', error);
        }
      });
      
      import('firebase/firestore').then(({ connectFirestoreEmulator }) => {
        try {
          connectFirestoreEmulator(db, 'localhost', 8080);
        } catch (error) {
          // Emulator already connected or error connecting
          console.log('Firestore emulator connection:', error);
        }
      });
      
      import('firebase/storage').then(({ connectStorageEmulator }) => {
        try {
          connectStorageEmulator(storage, 'localhost', 9199);
        } catch (error) {
          // Emulator already connected or error connecting
          console.log('Storage emulator connection:', error);
        }
      });
    }
    
    setInstances({ app: firebaseApp, auth, db, storage });
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
      storage={instances.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
