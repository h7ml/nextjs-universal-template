/**
 * Permission Constants
 * {{CHENGQI:
 * 操作: 新增;
 * 时间戳: 2025-10-30;
 * 原因: [P0-LD-003] 权限验证中间件实现;
 * 应用的原则: SOLID-S, DRY;
 * }}
 * 
 * Permission code format: module:action
 * Examples: 'user:create', 'cms:publish', 'file:delete'
 */

// Permission type enum
export enum PermissionType {
  MENU = 'menu',    // Menu access permission
  BUTTON = 'button', // Button/action permission
  API = 'api',      // API endpoint permission
}

// Permission modules
export const PERMISSION_MODULES = {
  SYSTEM: 'system',
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  CMS: 'cms',
  FILE: 'file',
  AUDIT: 'audit',
  DEPARTMENT: 'department',
  POSITION: 'position',
  MENU: 'menu',
  CONFIG: 'config',
  NOTIFICATION: 'notification',
  DASHBOARD: 'dashboard',
} as const;

// Define all permissions
export const PERMISSIONS = {
  // System Management
  SYSTEM_MANAGE: 'system:manage',
  
  // User Management
  USER_LIST: 'user:list',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_VIEW: 'user:view',
  USER_EXPORT: 'user:export',
  
  // Role Management
  ROLE_LIST: 'role:list',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  ROLE_ASSIGN: 'role:assign',
  
  // Permission Management
  PERMISSION_LIST: 'permission:list',
  PERMISSION_CREATE: 'permission:create',
  PERMISSION_UPDATE: 'permission:update',
  PERMISSION_DELETE: 'permission:delete',
  PERMISSION_ASSIGN: 'permission:assign',
  
  // CMS (Content Management)
  CMS_CATEGORY_LIST: 'cms:category:list',
  CMS_CATEGORY_CREATE: 'cms:category:create',
  CMS_CATEGORY_UPDATE: 'cms:category:update',
  CMS_CATEGORY_DELETE: 'cms:category:delete',
  CMS_CONTENT_LIST: 'cms:content:list',
  CMS_CONTENT_CREATE: 'cms:content:create',
  CMS_CONTENT_UPDATE: 'cms:content:update',
  CMS_CONTENT_DELETE: 'cms:content:delete',
  CMS_CONTENT_PUBLISH: 'cms:content:publish',
  CMS_CONTENT_UNPUBLISH: 'cms:content:unpublish',
  
  // File Management
  FILE_LIST: 'file:list',
  FILE_UPLOAD: 'file:upload',
  FILE_UPDATE: 'file:update',
  FILE_DELETE: 'file:delete',
  FILE_DOWNLOAD: 'file:download',
  
  // Audit Log
  AUDIT_LIST: 'audit:list',
  AUDIT_VIEW: 'audit:view',
  AUDIT_EXPORT: 'audit:export',
  
  // Department Management
  DEPARTMENT_LIST: 'department:list',
  DEPARTMENT_CREATE: 'department:create',
  DEPARTMENT_UPDATE: 'department:update',
  DEPARTMENT_DELETE: 'department:delete',
  
  // Position Management
  POSITION_LIST: 'position:list',
  POSITION_CREATE: 'position:create',
  POSITION_UPDATE: 'position:update',
  POSITION_DELETE: 'position:delete',
  
  // Menu Management
  MENU_LIST: 'menu:list',
  MENU_CREATE: 'menu:create',
  MENU_UPDATE: 'menu:update',
  MENU_DELETE: 'menu:delete',
  
  // System Configuration
  CONFIG_LIST: 'config:list',
  CONFIG_UPDATE: 'config:update',
  
  // Notification
  NOTIFICATION_LIST: 'notification:list',
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_DELETE: 'notification:delete',
  
  // Dashboard
  DASHBOARD_LIST: 'dashboard:list',
  DASHBOARD_CREATE: 'dashboard:create',
  DASHBOARD_UPDATE: 'dashboard:update',
  DASHBOARD_DELETE: 'dashboard:delete',
} as const;

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  ADMIN: [
    PERMISSIONS.SYSTEM_MANAGE,
    ...Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.SYSTEM_MANAGE),
  ],
  USER_MANAGER: [
    PERMISSIONS.USER_LIST,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.ROLE_LIST,
    PERMISSIONS.ROLE_ASSIGN,
  ],
  CONTENT_MANAGER: [
    PERMISSIONS.CMS_CATEGORY_LIST,
    PERMISSIONS.CMS_CATEGORY_CREATE,
    PERMISSIONS.CMS_CATEGORY_UPDATE,
    PERMISSIONS.CMS_CONTENT_LIST,
    PERMISSIONS.CMS_CONTENT_CREATE,
    PERMISSIONS.CMS_CONTENT_UPDATE,
    PERMISSIONS.CMS_CONTENT_PUBLISH,
    PERMISSIONS.FILE_LIST,
    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.FILE_DELETE,
  ],
  CONTENT_EDITOR: [
    PERMISSIONS.CMS_CATEGORY_LIST,
    PERMISSIONS.CMS_CONTENT_LIST,
    PERMISSIONS.CMS_CONTENT_CREATE,
    PERMISSIONS.CMS_CONTENT_UPDATE,
    PERMISSIONS.FILE_LIST,
    PERMISSIONS.FILE_UPLOAD,
  ],
  AUDITOR: [
    PERMISSIONS.AUDIT_LIST,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.AUDIT_EXPORT,
    PERMISSIONS.USER_LIST,
    PERMISSIONS.USER_VIEW,
  ],
} as const;

// Permission metadata for UI display
export const PERMISSION_METADATA: Record<string, {
  name: string;
  description: string;
  module: string;
  type: PermissionType;
}> = {
  [PERMISSIONS.USER_LIST]: {
    name: '用户列表',
    description: '查看用户列表',
    module: PERMISSION_MODULES.USER,
    type: PermissionType.API,
  },
  [PERMISSIONS.USER_CREATE]: {
    name: '创建用户',
    description: '创建新用户',
    module: PERMISSION_MODULES.USER,
    type: PermissionType.API,
  },
  [PERMISSIONS.USER_UPDATE]: {
    name: '更新用户',
    description: '更新用户信息',
    module: PERMISSION_MODULES.USER,
    type: PermissionType.API,
  },
  [PERMISSIONS.USER_DELETE]: {
    name: '删除用户',
    description: '删除用户',
    module: PERMISSION_MODULES.USER,
    type: PermissionType.API,
  },
  [PERMISSIONS.CMS_CONTENT_PUBLISH]: {
    name: '发布内容',
    description: '发布CMS内容',
    module: PERMISSION_MODULES.CMS,
    type: PermissionType.BUTTON,
  },
  [PERMISSIONS.FILE_UPLOAD]: {
    name: '上传文件',
    description: '上传文件到系统',
    module: PERMISSION_MODULES.FILE,
    type: PermissionType.API,
  },
  [PERMISSIONS.AUDIT_LIST]: {
    name: '审计日志',
    description: '查看审计日志',
    module: PERMISSION_MODULES.AUDIT,
    type: PermissionType.MENU,
  },
  // Add more metadata as needed...
};

// Helper function: Check if a permission code is valid
export function isValidPermission(code: string): boolean {
  return Object.values(PERMISSIONS).includes(code as any);
}

// Helper function: Get permission module from code
export function getPermissionModule(code: string): string {
  return code.split(':')[0];
}

// Helper function: Get permission action from code
export function getPermissionAction(code: string): string {
  return code.split(':').slice(1).join(':');
}

// Export permission values as array for seeding
export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
