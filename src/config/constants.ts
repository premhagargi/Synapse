/**
 * @fileoverview Application constants and configuration values
 */

export const APP_CONFIG = {
  name: 'Synapse AI',
  version: '1.0.0',
  description: 'Automated Finance & Compliance Platform',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002',
} as const;

export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

export const AI_CONFIG = {
  googleAI: {
    apiKey: process.env.GOOGLE_AI_API_KEY,
    model: 'gemini-2.0-flash',
  },
  genkit: {
    enabled: process.env.GENKIT_ENABLED === 'true',
    devPort: 4000,
  },
} as const;

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
} as const;

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: [
      '5 documents per month',
      'Basic analysis',
      'Email support',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 49,
    features: [
      'Unlimited documents',
      'Advanced analysis',
      'Compliance risk flagging',
      'Natural language Q&A',
      'Priority support',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 199,
    features: [
      'Everything in Pro',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
    ],
  },
} as const;

export const FILE_UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
  ],
  chunkSize: 1024 * 1024, // 1MB chunks for large files
} as const;

export const PAGINATION_CONFIG = {
  defaultLimit: 20,
  maxLimit: 100,
} as const;

export const CACHE_CONFIG = {
  documentTtl: 60 * 60 * 24, // 24 hours
  analysisTtl: 60 * 60 * 6, // 6 hours
  userTtl: 60 * 60, // 1 hour
} as const;

export const RATE_LIMITS = {
  documentUpload: {
    window: 60 * 1000, // 1 minute
    max: 10, // 10 uploads per minute
  },
  analysis: {
    window: 60 * 1000, // 1 minute
    max: 5, // 5 analyses per minute
  },
  export: {
    window: 60 * 1000, // 1 minute
    max: 3, // 3 exports per minute
  },
} as const;

export const FEATURE_FLAGS = {
  experimentalGenkitFlows: process.env.FEATURE_EXPERIMENTAL_GENKIT === 'true',
  enterpriseMode: process.env.FEATURE_ENTERPRISE_MODE === 'true',
  advancedAnalytics: process.env.FEATURE_ADVANCED_ANALYTICS === 'true',
  exportFeatures: process.env.FEATURE_EXPORT_FEATURES === 'true',
  chatInterface: process.env.FEATURE_CHAT_INTERFACE === 'true',
} as const;