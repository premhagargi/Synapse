'use client';

import {
  type Auth,
} from 'firebase/auth';
import {
  type Firestore,
} from 'firebase/firestore';
// Removed Firebase Storage imports - using chunking instead
import { FirebaseApp } from 'firebase/app';
import { createContext, ReactNode, useContext } from 'react';

type FirebaseContextValue = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({
  children,
  ...value
}: {
  children: ReactNode;
} & FirebaseContextValue) {
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  return useFirebase().app;
}

export function useAuth() {
  return useFirebase().auth;
}

// Removed useStorage hook - using chunking instead

export function useFirestore() {
  return useFirebase().db;
}
