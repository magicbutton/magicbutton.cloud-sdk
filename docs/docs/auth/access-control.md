---
sidebar_position: 5
---

# Access Control

Magic Button Auth includes a robust role-based access control (RBAC) system that allows you to restrict access to resources based on user roles and permissions. This page explains how to use the access control features of the library.

## Core Concepts

The access control system is built around these core concepts:

1. **Roles**: Groups of permissions assigned to users (e.g., "admin", "editor", "user")
2. **Permissions**: Specific actions users can perform (e.g., "posts:read", "users:write")
3. **Resources**: Items that permissions apply to (e.g., "posts", "users")
4. **Actions**: Operations that can be performed on resources (e.g., "read", "write", "delete")

## Using the Access Control Hook

The `useAccessControl` hook provides methods for checking user roles and permissions:

```tsx
import { useAccessControl } from '@magicbutton.cloud/auth';

const UserProfile = () => {
  const { hasRole, hasPermission, roles, permissions } = useAccessControl();
  
  return (
    <div className="user-profile">
      <h1>Your Access Level</h1>
      
      <div className="roles-section">
        <h2>Your Roles</h2>
        <ul>
          {roles.map(role => (
            <li key={role}>{role}</li>
          ))}
        </ul>
      </div>
      
      <div className="permissions-section">
        <h2>Your Permissions</h2>
        <ul>
          {permissions.map(permission => (
            <li key={permission}>{permission}</li>
          ))}
        </ul>
      </div>
      
      {/* Conditional rendering based on roles */}
      {hasRole('admin') && (
        <div className="admin-section">
          <h2>Admin Controls</h2>
          {/* Admin-only UI */}
        </div>
      )}
      
      {/* Conditional rendering based on permissions */}
      {hasPermission('users:write') && (
        <button className="edit-user-button">
          Edit User
        </button>
      )}
    </div>
  );
};
```

## Checking Multiple Roles or Permissions

You can check for multiple roles or permissions using arrays:

```tsx
// Check if user has ANY of these roles (OR logic)
if (hasRole(['admin', 'moderator'])) {
  // User has either admin OR moderator role
}

// Check if user has ANY of these permissions (OR logic)
if (hasPermission(['posts:write', 'posts:publish'])) {
  // User has either posts:write OR posts:publish permission
}

// Check if user has ALL of these roles (AND logic)
const hasAllRoles = roles.every(role => 
  userRoles.includes(role)
);

// Check if user has ALL of these permissions (AND logic)
const hasAllPermissions = permissions.every(permission => 
  userPermissions.includes(permission)
);
```

## Protected Routes

The `ProtectedRoute` component allows you to restrict access to routes based on authentication status, roles, or permissions:

```tsx
import { ProtectedRoute } from '@magicbutton.cloud/auth';
import { Route, Routes, Navigate } from 'react-router-dom';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public route - accessible to everyone */}
      <Route path="/" element={<HomePage />} />
      
      {/* Protected route - requires authentication */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute fallback={<Navigate to="/login" />}>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Role-based route - requires admin role */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute 
            requiredRoles="admin"
            fallback={<AccessDeniedPage />}
          >
            <AdminPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Permission-based route - requires specific permission */}
      <Route 
        path="/users/edit/:id" 
        element={
          <ProtectedRoute 
            requiredPermissions="users:write"
            fallback={<AccessDeniedPage />}
          >
            <EditUserPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Multiple requirements - requires any of these roles */}
      <Route 
        path="/content" 
        element={
          <ProtectedRoute 
            requiredRoles={['admin', 'editor', 'content-manager']}
            fallback={<AccessDeniedPage />}
          >
            <ContentPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Requiring ALL permissions instead of ANY */}
      <Route 
        path="/advanced-settings" 
        element={
          <ProtectedRoute 
            requiredPermissions={['settings:read', 'settings:write']}
            requireAllPermissions={true}
            fallback={<AccessDeniedPage />}
          >
            <AdvancedSettingsPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};
```

## Protected UI Elements

You can protect UI elements using the same access control hooks:

```tsx
import { useAccessControl } from '@magicbutton.cloud/auth';

const ActionButtons = () => {
  const { hasPermission } = useAccessControl();
  
  return (
    <div className="action-buttons">
      {/* Always visible */}
      <button className="view-button">View</button>
      
      {/* Only visible with edit permission */}
      {hasPermission('posts:edit') && (
        <button className="edit-button">Edit</button>
      )}
      
      {/* Only visible with delete permission */}
      {hasPermission('posts:delete') && (
        <button className="delete-button">Delete</button>
      )}
      
      {/* Only visible with publish permission */}
      {hasPermission('posts:publish') && (
        <button className="publish-button">Publish</button>
      )}
    </div>
  );
};
```

## Creating a Permission Guard Component

You can create your own reusable permission guard component:

```tsx
import React, { ReactNode } from 'react';
import { useAccessControl } from '@magicbutton.cloud/auth';

interface PermissionGuardProps {
  permission: string | string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  requireAll = false,
  fallback = null,
  children
}) => {
  const { hasPermission } = useAccessControl();
  
  const permissions = Array.isArray(permission) ? permission : [permission];
  
  if (requireAll) {
    // Must have ALL permissions
    const hasAll = permissions.every(p => hasPermission(p));
    return hasAll ? <>{children}</> : <>{fallback}</>;
  } else {
    // Must have ANY permission
    const hasAny = permissions.some(p => hasPermission(p));
    return hasAny ? <>{children}</> : <>{fallback}</>;
  }
};

// Usage example
const AdminUI = () => {
  return (
    <div>
      <h1>Admin Panel</h1>
      
      <PermissionGuard 
        permission="users:read" 
        fallback={<p>You don't have permission to view users.</p>}
      >
        <UsersList />
      </PermissionGuard>
      
      <PermissionGuard 
        permission={['settings:read', 'settings:write']} 
        requireAll={true}
      >
        <AdvancedSettings />
      </PermissionGuard>
    </div>
  );
};
```

## Access Control with Server Data

In real applications, roles and permissions often come from the server. Here's how to handle that:

### JWT Claims

If you're using JWT authentication, your tokens can include role and permission claims:

```json
{
  "sub": "user123",
  "name": "John Doe",
  "email": "john@example.com",
  "roles": ["admin", "user"],
  "permissions": ["posts:read", "posts:write", "users:read"],
  "exp": 1639569926
}
```

The auth library automatically extracts these claims and makes them available through the auth context.

### API Response Integration

If your roles and permissions come from an API response, you can update the user object:

```tsx
import { useAuth } from '@magicbutton.cloud/auth';
import { useEffect } from 'react';

const AuthRoleInitializer = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch roles and permissions from API
      const fetchUserAccess = async () => {
        try {
          const response = await fetch('https://api.example.com/user/access', {
            headers: {
              Authorization: `Bearer ${await getAccessToken()}`
            }
          });
          
          const data = await response.json();
          
          // Update user profile with roles and permissions
          updateProfile({
            ...user,
            roles: data.roles,
            permissions: data.permissions
          });
        } catch (error) {
          console.error('Failed to fetch user access:', error);
        }
      };
      
      fetchUserAccess();
    }
  }, [isAuthenticated, user, updateProfile]);
  
  return null;
};
```

## Best Practices

### Hierarchical Roles

Design your roles in a hierarchical structure where higher-level roles inherit permissions from lower-level roles:

```typescript
const roleHierarchy = {
  'user': ['posts:read', 'comments:read', 'comments:write'],
  'editor': ['posts:read', 'posts:write', 'comments:read', 'comments:write', 'comments:delete'],
  'admin': ['*'] // All permissions
};
```

### Permission Naming Conventions

Use a consistent naming convention for permissions:

```
resource:action
```

Examples:
- `posts:read` - Can read posts
- `posts:write` - Can create/edit posts
- `users:delete` - Can delete users

### Combining Frontend and Backend Validation

Always remember that frontend access control is for UI purposes only. Always implement the same access control rules on the server:

```typescript
// Frontend
const DeleteButton = () => {
  const { hasPermission } = useAccessControl();
  
  if (!hasPermission('users:delete')) {
    return null;
  }
  
  return <button onClick={handleDelete}>Delete User</button>;
};

// Backend (Node.js example)
app.delete('/api/users/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  
  // Check permissions on the server
  if (!decodedToken.permissions.includes('users:delete')) {
    return res.status(403).json({ error: 'Permission denied' });
  }
  
  // Proceed with deletion
  // ...
});
```

## Next Steps

Now that you understand access control, you can explore:

- [Components](components): Learn about built-in authentication components
- [Hooks](hooks): Discover more about React hooks for authentication