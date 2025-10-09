/**
 * @fileoverview Role-based access control service
 */

import { UserRole } from '@/shared/types';
import { logger } from '@/shared/lib/logger';

// Permission definitions for each role
export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: {
    // User management
    canManageUsers: true,
    canDeleteUsers: true,
    canChangeUserRoles: true,

    // Document access
    canAccessAllDocuments: true,
    canDeleteAnyDocument: true,
    canViewDocumentAnalytics: true,

    // System administration
    canAccessSystemSettings: true,
    canViewAuditLogs: true,
    canManageFeatureFlags: true,
    canAccessAnalytics: true,

    // Billing and subscriptions
    canManageSubscriptions: true,
    canViewBillingData: true,

    // Export capabilities
    canExportAllData: true,
    canBulkExport: true,
  },

  [UserRole.ANALYST]: {
    // User management
    canManageUsers: false,
    canDeleteUsers: false,
    canChangeUserRoles: false,

    // Document access
    canAccessAllDocuments: true,
    canDeleteAnyDocument: false,
    canViewDocumentAnalytics: true,

    // System administration
    canAccessSystemSettings: false,
    canViewAuditLogs: false,
    canManageFeatureFlags: false,
    canAccessAnalytics: true,

    // Billing and subscriptions
    canManageSubscriptions: false,
    canViewBillingData: false,

    // Export capabilities
    canExportAllData: false,
    canBulkExport: true,
  },

  [UserRole.VIEWER]: {
    // User management
    canManageUsers: false,
    canDeleteUsers: false,
    canChangeUserRoles: false,

    // Document access
    canAccessAllDocuments: false,
    canDeleteAnyDocument: false,
    canViewDocumentAnalytics: false,

    // System administration
    canAccessSystemSettings: false,
    canViewAuditLogs: false,
    canManageFeatureFlags: false,
    canAccessAnalytics: false,

    // Billing and subscriptions
    canManageSubscriptions: false,
    canViewBillingData: false,

    // Export capabilities
    canExportAllData: false,
    canBulkExport: false,
  },
} as const;

// Resource-action mapping for fine-grained permissions
export const RESOURCE_PERMISSIONS = {
  documents: {
    read: [UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER],
    write: [UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER],
    delete: [UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER],
    export: [UserRole.ADMIN, UserRole.ANALYST],
    bulk_export: [UserRole.ADMIN, UserRole.ANALYST],
  },

  users: {
    read: [UserRole.ADMIN],
    write: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
    change_role: [UserRole.ADMIN],
  },

  analytics: {
    read: [UserRole.ADMIN, UserRole.ANALYST],
    write: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
  },

  audit_logs: {
    read: [UserRole.ADMIN],
    write: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
  },

  feature_flags: {
    read: [UserRole.ADMIN],
    write: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
  },

  subscriptions: {
    read: [UserRole.ADMIN],
    write: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
  },
} as const;

export class RBACService {
  private static instance: RBACService;

  static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  /**
   * Check if a user has a specific permission
   */
  hasPermission(userRole: UserRole, permission: keyof typeof ROLE_PERMISSIONS[UserRole]): boolean {
    return ROLE_PERMISSIONS[userRole]?.[permission] || false;
  }

  /**
   * Check if a user can perform an action on a resource
   */
  canAccessResource(
    userRole: UserRole,
    resource: keyof typeof RESOURCE_PERMISSIONS,
    action: string
  ): boolean {
    const resourcePermissions = RESOURCE_PERMISSIONS[resource];
    if (!resourcePermissions) {
      return false;
    }

    const allowedRoles = resourcePermissions[action as keyof typeof resourcePermissions];
    if (!allowedRoles) {
      return false;
    }

    return allowedRoles.includes(userRole);
  }

  /**
   * Check if a user can access another user's data
   */
  canAccessUserData(userRole: UserRole, targetUserRole?: UserRole): boolean {
    if (userRole === UserRole.ADMIN) {
      return true;
    }

    if (userRole === UserRole.ANALYST && targetUserRole === UserRole.VIEWER) {
      return true;
    }

    return false;
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(role: UserRole): Record<string, boolean> {
    return { ...ROLE_PERMISSIONS[role] };
  }

  /**
   * Check if one role can manage another role
   */
  canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.ADMIN]: 3,
      [UserRole.ANALYST]: 2,
      [UserRole.VIEWER]: 1,
    };

    return roleHierarchy[managerRole] > roleHierarchy[targetRole];
  }

  /**
   * Validate role transition (prevent privilege escalation)
   */
  canTransitionToRole(currentRole: UserRole, newRole: UserRole): boolean {
    // Only admins can change roles
    if (currentRole !== UserRole.ADMIN) {
      return false;
    }

    // Prevent creating other admins unless current user is admin
    if (newRole === UserRole.ADMIN && currentRole !== UserRole.ADMIN) {
      return false;
    }

    return true;
  }

  /**
   * Get accessible resources for a role
   */
  getAccessibleResources(role: UserRole): string[] {
    const resources: string[] = [];

    for (const [resource, actions] of Object.entries(RESOURCE_PERMISSIONS)) {
      const hasAnyAccess = Object.values(actions).some(roles =>
        Array.isArray(roles) && roles.includes(role)
      );

      if (hasAnyAccess) {
        resources.push(resource);
      }
    }

    return resources;
  }

  /**
   * Check if user can perform bulk operations
   */
  canPerformBulkOperation(role: UserRole, operation: string): boolean {
    const bulkPermissions = {
      export: [UserRole.ADMIN, UserRole.ANALYST],
      delete: [UserRole.ADMIN],
      analyze: [UserRole.ADMIN, UserRole.ANALYST],
    };

    const allowedRoles = bulkPermissions[operation as keyof typeof bulkPermissions];
    return allowedRoles ? (allowedRoles as UserRole[]).includes(role) : false;
  }

  /**
   * Audit role-based access
   */
  async auditAccess(
    userId: string,
    role: UserRole,
    resource: string,
    action: string,
    granted: boolean,
    context?: Record<string, any>
  ): Promise<void> {
    await logger.info('RBAC access check', {
      userId,
      role,
      resource,
      action,
      granted,
      context,
    });
  }
}

// Export singleton instance
export const rbacService = RBACService.getInstance();

// Utility functions for common RBAC checks
export function checkDocumentAccess(userRole: UserRole, documentOwnerId?: string, currentUserId?: string): boolean {
  if (userRole === UserRole.ADMIN) {
    return true;
  }

  if (userRole === UserRole.ANALYST) {
    return true;
  }

  if (userRole === UserRole.VIEWER && documentOwnerId === currentUserId) {
    return true;
  }

  return false;
}

export function checkUserManagementAccess(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN;
}

export function checkAnalyticsAccess(userRole: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.ANALYST].includes(userRole);
}

export function checkAuditLogAccess(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN;
}