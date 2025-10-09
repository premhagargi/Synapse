/**
 * @fileoverview Multi-tenant service for managing tenant isolation and data segregation
 */

import { logger } from '@/shared/lib/logger';
import { UserRole } from '@/shared/types';

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  settings: {
    maxUsers: number;
    maxDocuments: number;
    features: string[];
    branding?: {
      logo?: string;
      colors?: {
        primary: string;
        secondary: string;
      };
    };
  };
  subscription: {
    tier: string;
    status: string;
    limits: {
      documents: number;
      users: number;
      storage: number; // in GB
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantContext {
  tenantId: string;
  userId: string;
  userRole: UserRole;
  permissions: string[];
}

export class MultiTenantService {
  private static instance: MultiTenantService;
  private tenants = new Map<string, Tenant>();
  private tenantUsers = new Map<string, Set<string>>();

  constructor() {
    this.initializeDefaultTenant();
  }

  static getInstance(): MultiTenantService {
    if (!MultiTenantService.instance) {
      MultiTenantService.instance = new MultiTenantService();
    }
    return MultiTenantService.instance;
  }

  /**
   * Initialize default tenant for development
   */
  private initializeDefaultTenant(): void {
    const defaultTenant: Tenant = {
      id: 'default',
      name: 'Default Organization',
      settings: {
        maxUsers: 1000,
        maxDocuments: 10000,
        features: ['basic', 'analytics', 'export'],
      },
      subscription: {
        tier: 'enterprise',
        status: 'active',
        limits: {
          documents: 10000,
          users: 1000,
          storage: 100,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tenants.set(defaultTenant.id, defaultTenant);
    this.tenantUsers.set(defaultTenant.id, new Set());
  }

  /**
   * Create a new tenant
   */
  async createTenant(
    name: string,
    domain?: string,
    settings?: Partial<Tenant['settings']>
  ): Promise<Tenant> {
    try {
      const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const tenant: Tenant = {
        id: tenantId,
        name,
        domain,
        settings: {
          maxUsers: 100,
          maxDocuments: 1000,
          features: ['basic'],
          branding: {},
          ...settings,
        },
        subscription: {
          tier: 'free',
          status: 'active',
          limits: {
            documents: 1000,
            users: 100,
            storage: 10,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.tenants.set(tenantId, tenant);
      this.tenantUsers.set(tenantId, new Set());

      await logger.info('Tenant created', {
        tenantId,
        name,
        domain,
      });

      return tenant;
    } catch (error) {
      await logger.error('Failed to create tenant', error as Error, {
        name,
        domain,
      });
      throw error;
    }
  }

  /**
   * Get tenant by ID
   */
  getTenant(tenantId: string): Tenant | null {
    return this.tenants.get(tenantId) || null;
  }

  /**
   * Add user to tenant
   */
  async addUserToTenant(tenantId: string, userId: string): Promise<void> {
    try {
      const tenant = this.tenants.get(tenantId);
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      const users = this.tenantUsers.get(tenantId);
      if (!users) {
        this.tenantUsers.set(tenantId, new Set([userId]));
      } else {
        users.add(userId);
      }

      await logger.info('User added to tenant', {
        tenantId,
        userId,
      });
    } catch (error) {
      await logger.error('Failed to add user to tenant', error as Error, {
        tenantId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Remove user from tenant
   */
  async removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
    try {
      const users = this.tenantUsers.get(tenantId);
      if (users) {
        users.delete(userId);
      }

      await logger.info('User removed from tenant', {
        tenantId,
        userId,
      });
    } catch (error) {
      await logger.error('Failed to remove user from tenant', error as Error, {
        tenantId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Check if user belongs to tenant
   */
  isUserInTenant(tenantId: string, userId: string): boolean {
    const users = this.tenantUsers.get(tenantId);
    return users ? users.has(userId) : false;
  }

  /**
   * Get all users in a tenant
   */
  getTenantUsers(tenantId: string): string[] {
    const users = this.tenantUsers.get(tenantId);
    return users ? Array.from(users) : [];
  }

  /**
   * Check tenant limits
   */
  checkTenantLimits(tenantId: string, resource: 'users' | 'documents' | 'storage'): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return false;
    }

    const users = this.getTenantUsers(tenantId);

    switch (resource) {
      case 'users':
        return users.length < tenant.settings.maxUsers;
      case 'documents':
        // In a real implementation, you would check actual document count
        return true; // Placeholder
      case 'storage':
        // In a real implementation, you would check actual storage usage
        return true; // Placeholder
      default:
        return false;
    }
  }

  /**
   * Get tenant context for a user
   */
  getTenantContext(tenantId: string, userId: string): TenantContext | null {
    if (!this.isUserInTenant(tenantId, userId)) {
      return null;
    }

    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return null;
    }

    // Determine user permissions based on role and tenant settings
    const permissions = this.calculateUserPermissions(tenant, userId);

    return {
      tenantId,
      userId,
      userRole: this.getUserRoleInTenant(tenant, userId),
      permissions,
    };
  }

  /**
   * Update tenant settings
   */
  async updateTenantSettings(
    tenantId: string,
    settings: Partial<Tenant['settings']>
  ): Promise<void> {
    try {
      const tenant = this.tenants.get(tenantId);
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      tenant.settings = { ...tenant.settings, ...settings };
      tenant.updatedAt = new Date();

      await logger.info('Tenant settings updated', {
        tenantId,
        updatedSettings: Object.keys(settings),
      });
    } catch (error) {
      await logger.error('Failed to update tenant settings', error as Error, {
        tenantId,
        settings,
      });
      throw error;
    }
  }

  /**
   * Delete tenant
   */
  async deleteTenant(tenantId: string): Promise<void> {
    try {
      const tenant = this.tenants.get(tenantId);
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      // Check if tenant has users
      const users = this.getTenantUsers(tenantId);
      if (users.length > 0) {
        throw new Error(`Cannot delete tenant with ${users.length} users`);
      }

      this.tenants.delete(tenantId);
      this.tenantUsers.delete(tenantId);

      await logger.info('Tenant deleted', {
        tenantId,
        name: tenant.name,
      });
    } catch (error) {
      await logger.error('Failed to delete tenant', error as Error, {
        tenantId,
      });
      throw error;
    }
  }

  /**
   * Get all tenants
   */
  getAllTenants(): Tenant[] {
    return Array.from(this.tenants.values());
  }

  /**
   * Validate tenant access
   */
  validateTenantAccess(tenantId: string, userId: string, requiredPermission?: string): boolean {
    const context = this.getTenantContext(tenantId, userId);
    if (!context) {
      return false;
    }

    if (requiredPermission && !context.permissions.includes(requiredPermission)) {
      return false;
    }

    return true;
  }

  // Private helper methods
  private calculateUserPermissions(tenant: Tenant, userId: string): string[] {
    const permissions: string[] = [];

    // Base permissions for all users
    permissions.push('read_documents');

    // Role-based permissions (in a real implementation, this would be more sophisticated)
    if (this.getUserRoleInTenant(tenant, userId) === UserRole.ADMIN) {
      permissions.push(
        'manage_users',
        'manage_settings',
        'delete_documents',
        'export_data',
        'view_analytics',
        'manage_billing'
      );
    } else if (this.getUserRoleInTenant(tenant, userId) === UserRole.ANALYST) {
      permissions.push(
        'analyze_documents',
        'export_data',
        'view_analytics'
      );
    }

    // Feature-based permissions
    if (tenant.settings.features.includes('export')) {
      permissions.push('export_documents');
    }

    if (tenant.settings.features.includes('analytics')) {
      permissions.push('view_analytics');
    }

    return permissions;
  }

  private getUserRoleInTenant(tenant: Tenant, userId: string): UserRole {
    // In a real implementation, this would check user roles within the tenant
    // For now, we'll use a simple mapping
    if (userId.startsWith('admin')) {
      return UserRole.ADMIN;
    } else if (userId.startsWith('analyst')) {
      return UserRole.ANALYST;
    } else {
      return UserRole.VIEWER;
    }
  }
}

// Export singleton instance
export const multiTenantService = MultiTenantService.getInstance();

// Convenience functions
export async function createTenant(
  name: string,
  domain?: string,
  settings?: Partial<Tenant['settings']>
): Promise<Tenant> {
  return multiTenantService.createTenant(name, domain, settings);
}

export function getTenant(tenantId: string): Tenant | null {
  return multiTenantService.getTenant(tenantId);
}

export async function addUserToTenant(tenantId: string, userId: string): Promise<void> {
  return multiTenantService.addUserToTenant(tenantId, userId);
}

export function isUserInTenant(tenantId: string, userId: string): boolean {
  return multiTenantService.isUserInTenant(tenantId, userId);
}

export function validateTenantAccess(
  tenantId: string,
  userId: string,
  requiredPermission?: string
): boolean {
  return multiTenantService.validateTenantAccess(tenantId, userId, requiredPermission);
}

export function getTenantContext(tenantId: string, userId: string): TenantContext | null {
  return multiTenantService.getTenantContext(tenantId, userId);
}