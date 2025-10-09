'use client';

/**
 * @fileoverview Role-based access control component
 */

import React, { ReactNode } from 'react';
import { useAuth } from '../hooks/use-auth';
import { UserRole } from '@/shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  requireAll?: boolean; // If true, user must have ALL roles; if false, user needs at least ONE role
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback,
  requireAll = false
}: RoleGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return fallback || (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <Lock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please log in to access this content.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const hasAccess = requireAll
    ? allowedRoles.every(role => user.role === role)
    : allowedRoles.includes(user.role);

  if (!hasAccess) {
    return fallback || (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-orange-400 mb-4" />
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this content.
            Required roles: {allowedRoles.join(', ')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600">
            Contact your administrator if you believe this is an error.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

// Convenience components for common role checks
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function AnalystOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.ANALYST]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function ViewerOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

// Hook for role-based logic in components
export function useRoleAccess() {
  const { user } = useAuth();

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = (): boolean => hasRole([UserRole.ADMIN]);
  const isAnalyst = (): boolean => hasRole([UserRole.ADMIN, UserRole.ANALYST]);
  const isViewer = (): boolean => hasRole([UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER]);

  return {
    user,
    hasRole,
    isAdmin,
    isAnalyst,
    isViewer,
  };
}