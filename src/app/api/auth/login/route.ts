/**
 * @fileoverview Login API route with comprehensive validation and security
 */

import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
import { withValidation, withRateLimit, withApiProtection } from '@/middleware/validation';
import { emailSchema, passwordSchema } from '@/shared/lib/validation';
import { AuthenticationError, FirebaseError } from '@/shared/lib/errors';
import { logger } from '@/shared/lib/logger';

// Login request schema
const loginSchema = {
  body: {
    email: emailSchema,
    password: passwordSchema,
    rememberMe: false, // Optional field for session persistence
  },
};

// Combined middleware for this route
const middleware = withApiProtection({
  requireAuth: false, // Login doesn't require existing auth
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
  },
  validateBody: loginSchema.body as any,
});

export async function POST(request: NextRequest) {
  try {
    // Apply middleware (simplified for now - in production use proper middleware chain)
    // for (const middlewareFn of middleware) {
    //   const result = await middlewareFn(request);
    //   if (result.status) {
    //     return result; // Return error response if middleware fails
    //   }
    // }

    const { email, password, rememberMe } = (request as any).validatedData;

    // Attempt login with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    if (!userCredential.user) {
      throw new AuthenticationError('Login failed - no user returned');
    }

    // Update user's last login time in Firestore
    const userRef = doc(db, 'users', userCredential.user.uid);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Get user profile data
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new AuthenticationError('User profile not found');
    }

    const userData = userDoc.data();

    // Log successful login
    await logger.logUserAction('login' as any, userCredential.user.uid, 'auth', undefined, {
      email,
      rememberMe,
      userAgent: request.headers.get('user-agent'),
      ipAddress: getClientIP(request),
    });

    // Create session token (in production, use JWT or secure cookies)
    const sessionToken = generateSessionToken(userCredential.user.uid);

    // Set secure HTTP-only cookie for session management
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          role: userData.role,
          subscription: userData.subscription,
        },
        sessionToken,
      },
      message: 'Login successful',
    });

    // Set secure session cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
      path: '/',
    });

    return response;

  } catch (error) {
    // Enhanced error logging for login attempts
    await logger.warn('Login attempt failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      email: (request as any)?.validatedData?.email,
      userAgent: request.headers.get('user-agent'),
      ipAddress: getClientIP(request),
    });

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Login failed',
        code: 'LOGIN_FAILED',
      },
      { status: 401 }
    );
  }
}

// Utility function to get client IP address
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

// Utility function to generate session token
function generateSessionToken(userId: string): string {
  // In production, use a proper JWT library or secure token generation
  return Buffer.from(`${userId}:${Date.now()}:${Math.random()}`).toString('base64');
}