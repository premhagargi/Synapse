'use client';

/**
 * @fileoverview Authentication hook for managing user state
 */

import { useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
  type User as FirebaseUser,
  type AuthError
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { logger } from '@/shared/lib';
import { AuthenticationError, FirebaseError } from '@/shared/lib/errors';
import type { AuthUser, LoginCredentials, SignupData, PasswordResetData, ChangePasswordData } from '../types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = useFirebaseAuth();
  const db = useFirestore();

  // Convert Firebase user to AuthUser
  const convertFirebaseUser = useCallback(async (firebaseUser: FirebaseUser): Promise<AuthUser> => {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      throw new AuthenticationError('User profile not found');
    }

    const userData = userDoc.data();

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      role: userData.role || 'viewer',
      subscription: userData.subscription || {
        tier: 'free',
        status: 'active'
      },
      emailVerified: firebaseUser.emailVerified,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || new Date(),
      lastLoginAt: userData.lastLoginAt?.toDate(),
    };
  }, [db]);

  // Create user profile in Firestore
  const createUserProfile = useCallback(async (firebaseUser: FirebaseUser, additionalData?: Partial<AuthUser>) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || additionalData?.displayName,
      role: additionalData?.role || 'viewer',
      subscription: additionalData?.subscription || {
        tier: 'free',
        status: 'active'
      },
      emailVerified: firebaseUser.emailVerified,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    await setDoc(userRef, userData);

    // Log user creation
    await logger.logUserAction('user_create' as any, firebaseUser.uid, 'user', firebaseUser.uid, {
      email: firebaseUser.email,
      role: userData.role,
    });

    return convertFirebaseUser(firebaseUser);
  }, [db, convertFirebaseUser]);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Partial<AuthUser>) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Update local state
    setUser(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);

    // Log user update
    await logger.logUserAction('user_update' as any, user.uid, 'user', user.uid, {
      updatedFields: Object.keys(updates),
    });
  }, [user, db]);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Update last login time
      if (userCredential.user) {
        const userRef = doc(db, 'users', userCredential.user.uid);
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
        });

        // Log successful login
        await logger.logUserAction('login' as any, userCredential.user.uid, 'auth', undefined, {
          email: credentials.email,
          rememberMe: credentials.rememberMe,
        });
      }
    } catch (err) {
      const error = err as AuthError;
      setError(error.message);

      // Log failed login attempt
      await logger.warn('Login failed', {
        error: error.message,
        email: credentials.email,
      });

      throw new AuthenticationError(error.message);
    } finally {
      setLoading(false);
    }
  }, [auth, db]);

  // Signup function
  const signup = useCallback(async (data: SignupData) => {
    try {
      setLoading(true);
      setError(null);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      if (userCredential.user) {
        // Create user profile
        await createUserProfile(userCredential.user, {
          displayName: data.displayName,
        });

        // Send email verification
        // await userCredential.user.sendEmailVerification();

        // Log successful signup
        await logger.logUserAction('user_create' as any, userCredential.user.uid, 'user', userCredential.user.uid, {
          email: data.email,
          displayName: data.displayName,
        });
      }
    } catch (err) {
      const error = err as AuthError;
      setError(error.message);

      // Log failed signup attempt
      await logger.warn('Signup failed', {
        error: error.message,
        email: data.email,
      });

      throw new AuthenticationError(error.message);
    } finally {
      setLoading(false);
    }
  }, [auth, createUserProfile]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      if (user) {
        // Log logout
        await logger.logUserAction('logout' as any, user.uid, 'auth');
      }

      await signOut(auth);
      setUser(null);
    } catch (err) {
      const error = err as AuthError;
      throw new FirebaseError(error.message, error.code);
    }
  }, [auth, user]);

  // Reset password function
  const resetPassword = useCallback(async (data: PasswordResetData) => {
    try {
      await sendPasswordResetEmail(auth, data.email);

      // Log password reset request
      await logger.info('Password reset requested', {
        email: data.email,
      });
    } catch (err) {
      const error = err as AuthError;
      throw new AuthenticationError(error.message);
    }
  }, [auth]);

  // Change password function
  const changePassword = useCallback(async (data: ChangePasswordData) => {
    try {
      if (!user || !auth.currentUser) {
        throw new AuthenticationError('User not authenticated');
      }

      // Re-authenticate user with current password
      const credential = await signInWithEmailAndPassword(
        auth,
        user.email || '',
        data.currentPassword
      );

      // Update password
      await updatePassword(credential.user, data.newPassword);

      // Log password change
      await logger.logUserAction('user_update' as any, user.uid, 'user', user.uid, {
        action: 'password_change',
      });
    } catch (err) {
      const error = err as AuthError;
      throw new AuthenticationError(error.message);
    }
  }, [auth, user]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      if (!auth.currentUser) {
        setUser(null);
        return;
      }

      const updatedUser = await convertFirebaseUser(auth.currentUser);
      setUser(updatedUser);
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      setUser(null);
    }
  }, [auth, convertFirebaseUser]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (firebaseUser) {
            const authUser = await convertFirebaseUser(firebaseUser);
            setUser(authUser);
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error('Auth state change error:', err);
          setUser(null);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth, convertFirebaseUser]);

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    signup,
    logout,
    resetPassword,
    changePassword,
    refreshUser,
    clearError,
    updateUserProfile,
  };
}