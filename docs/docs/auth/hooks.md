---
sidebar_position: 7
---

# Hooks

Magic Button Auth provides several React hooks that make it easy to access authentication functionality in your components. This page documents the available hooks and how to use them.

## useAuth

The `useAuth` hook provides access to the authentication context, including the current user, authentication state, and methods for authentication operations.

### Return Value

The hook returns an object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `isAuthenticated` | `boolean` | Whether the user is authenticated |
| `user` | `User \| null` | Current user information |
| `tokens` | `AuthTokens \| null` | Authentication tokens |
| `isLoading` | `boolean` | Whether authentication is in progress |
| `error` | `Error \| null` | Authentication error, if any |
| `initialize` | `() => Promise<void>` | Initialize authentication |
| `login` | `(credentials?: Record<string, any>) => Promise<User>` | Log in with credentials |
| `logout` | `() => Promise<void>` | Log out the current user |
| `register` | `(userData: Record<string, any>) => Promise<User>` | Register a new user |
| `getAccessToken` | `() => Promise<string>` | Get a fresh access token |
| `hasRole` | `(role: string \| string[]) => boolean` | Check if user has a specific role |
| `hasPermission` | `(permission: string \| string[]) => boolean` | Check if user has a specific permission |
| `updateProfile` | `(data: Partial<User>) => Promise<User>` | Update user profile |

### Examples

#### Basic Usage

```tsx
import { useAuth } from '@magicbutton.cloud/auth';

const ProfilePage = () => {
  const { user, isLoading, error } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  if (!user) {
    return <div>Not logged in</div>;
  }
  
  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      
      {user.roles && (
        <div>
          <h2>Roles</h2>
          <ul>
            {user.roles.map(role => (
              <li key={role}>{role}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

#### Authentication Operations

```tsx
import { useAuth } from '@magicbutton.cloud/auth';
import { useState } from 'react';

const AuthButtons = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    
    try {
      await login({
        email: 'user@example.com',
        password: 'password123'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };
  
  return (
    <div>
      {error && <div className="error">{error}</div>}
      
      {isAuthenticated ? (
        <button onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </button>
      )}
    </div>
  );
};
```

#### Getting a Fresh Access Token

```tsx
import { useAuth } from '@magicbutton.cloud/auth';
import { useState, useEffect } from 'react';

const ApiDataFetcher = () => {
  const { getAccessToken } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get a fresh access token
        const token = await getAccessToken();
        
        // Use the token to make an API request
        const response = await fetch('https://api.example.com/data', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [getAccessToken]);
  
  // Render component...
};
```

#### Updating User Profile

```tsx
import { useAuth } from '@magicbutton.cloud/auth';
import { useState } from 'react';

const ProfileEditor = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    
    try {
      await updateProfile({
        name
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <button 
        type="submit"
        disabled={isUpdating}
      >
        {isUpdating ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
};
```

## useAccessControl

The `useAccessControl` hook provides simplified access to role and permission checking functionality.

### Return Value

The hook returns an object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `hasRole` | `(role: string \| string[]) => boolean` | Check if user has a specific role |
| `hasPermission` | `(permission: string \| string[]) => boolean` | Check if user has a specific permission |
| `roles` | `string[]` | Array of user's roles |
| `permissions` | `string[]` | Array of user's permissions |

### Examples

#### Basic Usage

```tsx
import { useAccessControl } from '@magicbutton.cloud/auth';

const UserActions = () => {
  const { hasRole, hasPermission } = useAccessControl();
  
  return (
    <div className="user-actions">
      {/* Basic role check */}
      {hasRole('admin') && (
        <button className="admin-button">
          Admin Settings
        </button>
      )}
      
      {/* Basic permission check */}
      {hasPermission('users:write') && (
        <button className="edit-button">
          Edit User
        </button>
      )}
      
      {/* Check for any of multiple roles */}
      {hasRole(['admin', 'moderator']) && (
        <button className="moderate-button">
          Moderate Content
        </button>
      )}
      
      {/* Check for any of multiple permissions */}
      {hasPermission(['posts:publish', 'posts:review']) && (
        <button className="publish-button">
          Publish/Review
        </button>
      )}
    </div>
  );
};
```

#### Displaying User Roles and Permissions

```tsx
import { useAccessControl } from '@magicbutton.cloud/auth';

const UserPermissions = () => {
  const { roles, permissions } = useAccessControl();
  
  return (
    <div className="user-permissions">
      <div className="roles-section">
        <h2>Your Roles</h2>
        {roles.length > 0 ? (
          <ul>
            {roles.map(role => (
              <li key={role}>{role}</li>
            ))}
          </ul>
        ) : (
          <p>No roles assigned</p>
        )}
      </div>
      
      <div className="permissions-section">
        <h2>Your Permissions</h2>
        {permissions.length > 0 ? (
          <ul>
            {permissions.map(permission => (
              <li key={permission}>{permission}</li>
            ))}
          </ul>
        ) : (
          <p>No permissions assigned</p>
        )}
      </div>
    </div>
  );
};
```

#### Feature Toggling

```tsx
import { useAccessControl } from '@magicbutton.cloud/auth';

// Define feature flags based on permissions
const useFeatureFlags = () => {
  const { hasPermission, hasRole } = useAccessControl();
  
  return {
    // Features controlled by permissions
    canCreateUsers: hasPermission('users:create'),
    canDeleteUsers: hasPermission('users:delete'),
    canManageContent: hasPermission(['content:create', 'content:edit', 'content:delete']),
    
    // Features controlled by roles
    isAdmin: hasRole('admin'),
    isContentEditor: hasRole('editor'),
    
    // More complex feature flags
    hasAdvancedContentTools: hasRole('editor') && hasPermission('content:advanced'),
  };
};

// Usage in a component
const ContentEditor = () => {
  const { 
    canManageContent, 
    isContentEditor, 
    hasAdvancedContentTools 
  } = useFeatureFlags();
  
  if (!canManageContent) {
    return <AccessDeniedMessage />;
  }
  
  return (
    <div className="content-editor">
      <h1>Content Editor</h1>
      
      {/* Basic editing tools available to anyone with content management */}
      <BasicEditorTools />
      
      {/* Editor-specific tools */}
      {isContentEditor && <EditorTools />}
      
      {/* Advanced tools require specific permission */}
      {hasAdvancedContentTools && <AdvancedEditorTools />}
    </div>
  );
};
```

## Creating Custom Hooks

You can create your own custom hooks that build on the provided hooks to add additional functionality.

### Custom API Request Hook

```tsx
import { useAuth } from '@magicbutton.cloud/auth';
import { useState, useCallback } from 'react';

// Custom hook for making authenticated API requests
export const useAuthenticatedFetch = () => {
  const { getAccessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchWithAuth = useCallback(
    async <T,>(
      url: string,
      options: RequestInit = {}
    ): Promise<T> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = await getAccessToken();
        
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Request failed with status ${response.status}`
          );
        }
        
        const data = await response.json();
        return data as T;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [getAccessToken]
  );
  
  return {
    fetchWithAuth,
    isLoading,
    error,
  };
};

// Usage example
const UserDataComponent = () => {
  const { fetchWithAuth, isLoading, error } = useAuthenticatedFetch();
  const [userData, setUserData] = useState(null);
  
  const fetchUserData = async () => {
    try {
      const data = await fetchWithAuth('https://api.example.com/user');
      setUserData(data);
    } catch (err) {
      // Error handling is already done in the hook
    }
  };
  
  // Component rendering...
};
```

### Role-Based Navigation Hook

```tsx
import { useAccessControl } from '@magicbutton.cloud/auth';

// Define navigation items with role/permission requirements
const navigationItems = [
  { 
    name: 'Dashboard', 
    path: '/dashboard', 
    requiredRoles: [] // Accessible to all authenticated users
  },
  { 
    name: 'Profile', 
    path: '/profile', 
    requiredRoles: [] // Accessible to all authenticated users
  },
  { 
    name: 'Users', 
    path: '/users', 
    requiredRoles: ['admin'] // Only for admins
  },
  { 
    name: 'Content', 
    path: '/content', 
    requiredRoles: ['admin', 'editor'] // For admins or editors
  },
  { 
    name: 'Settings', 
    path: '/settings', 
    requiredPermissions: ['settings:read'] // Based on permissions
  },
  { 
    name: 'Advanced', 
    path: '/advanced', 
    requiredRoles: ['admin'],
    requiredPermissions: ['advanced:access'] // Requires both role and permission
  },
];

// Custom hook for role-based navigation
export const useNavigation = () => {
  const { hasRole, hasPermission } = useAccessControl();
  
  // Filter navigation items based on user's roles and permissions
  const authorizedItems = navigationItems.filter(item => {
    // Check roles if required
    if (item.requiredRoles && item.requiredRoles.length > 0) {
      if (!item.requiredRoles.some(role => hasRole(role))) {
        return false;
      }
    }
    
    // Check permissions if required
    if (item.requiredPermissions && item.requiredPermissions.length > 0) {
      if (!item.requiredPermissions.some(permission => hasPermission(permission))) {
        return false;
      }
    }
    
    return true;
  });
  
  return { navigationItems: authorizedItems };
};

// Usage example
const Navigation = () => {
  const { navigationItems } = useNavigation();
  
  return (
    <nav>
      <ul>
        {navigationItems.map(item => (
          <li key={item.path}>
            <a href={item.path}>{item.name}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

## Best Practices

### Optimizing Performance

1. **Memoize Expensive Operations**: Use `useMemo` and `useCallback` to memoize expensive operations.

```tsx
const UserRolesList = ({ userId }) => {
  const { user } = useAuth();
  
  // Memoize the mapping operation
  const roleDisplay = useMemo(() => {
    if (!user?.roles) return [];
    
    return user.roles.map(role => ({
      id: role,
      displayName: role.charAt(0).toUpperCase() + role.slice(1),
      color: getRoleColor(role) // Some function to determine role color
    }));
  }, [user?.roles]);
  
  return (
    <div>
      {roleDisplay.map(role => (
        <span 
          key={role.id}
          style={{ color: role.color }}
        >
          {role.displayName}
        </span>
      ))}
    </div>
  );
};
```

2. **Avoid Unnecessary Rerenders**: Only destructure the properties you need from the hooks.

```tsx
// Bad: Component will rerender on ANY auth state change
const UserGreeting = () => {
  const auth = useAuth(); // Destructures the entire auth object
  
  return <div>Hello, {auth.user?.name || 'Guest'}</div>;
};

// Good: Component will only rerender when user changes
const UserGreeting = () => {
  const { user } = useAuth(); // Only destructure what you need
  
  return <div>Hello, {user?.name || 'Guest'}</div>;
};
```

### Error Handling

Implement consistent error handling patterns:

```tsx
const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  
  const handleUpdateProfile = async (data) => {
    try {
      setError(null);
      await updateProfile(data);
    } catch (err) {
      // Standardize error handling
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('An unknown error occurred'));
      }
      
      // Optional: Log errors to your monitoring system
      logError('updateProfile', err);
    }
  };
  
  return (
    <div>
      {error && (
        <ErrorDisplay 
          error={error}
          onDismiss={() => setError(null)}
        />
      )}
      
      {/* Profile form */}
    </div>
  );
};
```

## Summary

The hooks provided by Magic Button Auth make it easy to integrate authentication and authorization into your React components. The `useAuth` hook gives you access to authentication state and methods, while the `useAccessControl` hook simplifies role and permission checking. You can also create your own custom hooks to build on these foundations and add functionality specific to your application.