---
sidebar_position: 6
---

# Components

Magic Button Auth includes several ready-to-use React components to simplify integration with your application. This page outlines the available components and their usage.

## AuthProvider

The `AuthProvider` component is the foundation of Magic Button Auth. It provides authentication context to your entire application.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `AuthConfig` | Configuration object for the authentication provider |
| `initialState` | `Partial<AuthState>` | Optional initial authentication state |
| `storageProvider` | `StorageProvider` | Optional custom storage provider |
| `children` | `ReactNode` | Child components |

### Example

```tsx
import { AuthProvider } from '@magicbutton.cloud/auth';

const App = () => {
  return (
    <AuthProvider
      config={{
        authUrl: 'https://auth.example.com',
        clientId: 'your-client-id',
        method: 'jwt',
        storage: 'localStorage',
      }}
    >
      <YourApp />
    </AuthProvider>
  );
};
```

### Configuration Options

The `config` prop accepts an object with these properties:

| Property | Type | Description |
|----------|------|-------------|
| `authUrl` | `string` | Base URL for authentication service |
| `clientId` | `string` | Client identifier for your application |
| `clientSecret` | `string (optional)` | Client secret for confidential clients |
| `redirectUrl` | `string (optional)` | Redirect URL after successful authentication |
| `storage` | `'localStorage' \| 'sessionStorage' \| 'memory' \| 'cookie'` | Token storage method |
| `method` | `'jwt' \| 'oauth' \| 'basic' \| 'saml' \| 'custom'` | Authentication method |
| `autoRefresh` | `boolean` | Whether to automatically refresh tokens |
| `refreshBuffer` | `number` | Time in seconds before token expiry to refresh |
| `scope` | `string (optional)` | Scope requests for OAuth authentication |

## ProtectedRoute

The `ProtectedRoute` component restricts access to routes based on authentication state, roles, or permissions.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Content to render if the user has access |
| `fallback` | `ReactNode` | Content to render if the user doesn't have access |
| `requiredRoles` | `string \| string[]` | Required roles for access |
| `requiredPermissions` | `string \| string[]` | Required permissions for access |
| `requireAllRoles` | `boolean` | Whether all roles are required (default: false) |
| `requireAllPermissions` | `boolean` | Whether all permissions are required (default: false) |
| `loadingComponent` | `ReactNode` | Component to show while authentication is loading |

### Examples

#### Basic Authentication Check

```tsx
import { ProtectedRoute } from '@magicbutton.cloud/auth';
import { Navigate } from 'react-router-dom';

// Only accessible if the user is authenticated
<ProtectedRoute fallback={<Navigate to="/login" />}>
  <DashboardPage />
</ProtectedRoute>
```

#### Role-Based Protection

```tsx
// Only accessible if the user has the 'admin' role
<ProtectedRoute 
  requiredRoles="admin"
  fallback={<AccessDeniedPage />}
>
  <AdminPage />
</ProtectedRoute>
```

#### Permission-Based Protection

```tsx
// Only accessible if the user has the 'users:read' permission
<ProtectedRoute 
  requiredPermissions="users:read"
  fallback={<AccessDeniedPage />}
>
  <UsersPage />
</ProtectedRoute>
```

#### Multiple Requirements

```tsx
// Accessible if the user has any of these roles
<ProtectedRoute 
  requiredRoles={['admin', 'editor', 'content-manager']}
  fallback={<AccessDeniedPage />}
>
  <ContentPage />
</ProtectedRoute>

// Accessible only if the user has ALL of these permissions
<ProtectedRoute 
  requiredPermissions={['settings:read', 'settings:write']}
  requireAllPermissions={true}
  fallback={<AccessDeniedPage />}
>
  <SettingsPage />
</ProtectedRoute>
```

#### Custom Loading Component

```tsx
<ProtectedRoute 
  loadingComponent={<CustomLoadingSpinner />}
  fallback={<Navigate to="/login" />}
>
  <ProfilePage />
</ProtectedRoute>
```

## LoginForm

The `LoginForm` component provides a ready-to-use login form that integrates with the auth context.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `onSuccess` | `() => void` | Callback called after successful login |
| `onError` | `(error: Error) => void` | Callback called after login error |
| `className` | `string` | Custom form class |
| `buttonClassName` | `string` | Custom button class |
| `inputClassName` | `string` | Custom input class |
| `labelClassName` | `string` | Custom label class |
| `errorClassName` | `string` | Custom error class |
| `showRegisterLink` | `boolean` | Whether to show registration link |
| `registerUrl` | `string` | Registration URL |
| `registerLinkText` | `string` | Registration link text |
| `renderFields` | `(fields, handleChange) => ReactNode` | Custom renderer for form fields |

### Examples

#### Basic Usage

```tsx
import { LoginForm } from '@magicbutton.cloud/auth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="login-page">
      <h1>Login</h1>
      
      <LoginForm
        onSuccess={() => navigate('/dashboard')}
        onError={(error) => console.error('Login failed:', error)}
      />
    </div>
  );
};
```

#### Custom Styling

```tsx
<LoginForm
  className="custom-form"
  buttonClassName="custom-button"
  inputClassName="custom-input"
  labelClassName="custom-label"
  errorClassName="custom-error"
  onSuccess={() => navigate('/dashboard')}
/>
```

#### With Registration Link

```tsx
<LoginForm
  showRegisterLink={true}
  registerUrl="/register"
  registerLinkText="Need an account? Sign up here"
  onSuccess={() => navigate('/dashboard')}
/>
```

#### Custom Fields Renderer

```tsx
<LoginForm
  onSuccess={() => navigate('/dashboard')}
  renderFields={(fields, handleChange) => (
    <>
      <TextField
        label="Email Address"
        variant="outlined"
        fullWidth
        margin="normal"
        name="email"
        value={fields.email}
        onChange={handleChange}
        autoComplete="email"
      />
      
      <TextField
        label="Password"
        variant="outlined"
        fullWidth
        margin="normal"
        name="password"
        type="password"
        value={fields.password}
        onChange={handleChange}
        autoComplete="current-password"
      />
    </>
  )}
/>
```

## Creating Custom Components

You can create your own custom authentication-related components using the provided hooks:

### Custom Profile Menu Example

```tsx
import React, { useState } from 'react';
import { useAuth } from '@magicbutton.cloud/auth';

const ProfileMenu = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="profile-menu">
      <button 
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src={user?.picture || '/default-avatar.png'} 
          alt="Profile" 
          className="avatar"
        />
        <span className="username">{user?.name || 'User'}</span>
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          <a href="/profile" className="menu-item">
            Profile
          </a>
          <a href="/settings" className="menu-item">
            Settings
          </a>
          <button 
            className="menu-item logout-button"
            onClick={() => logout()}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
```

### Custom Auth Status Indicator

```tsx
import React from 'react';
import { useAuth } from '@magicbutton.cloud/auth';

const AuthStatus = () => {
  const { isAuthenticated, isLoading, error } = useAuth();
  
  if (isLoading) {
    return <div className="auth-status loading">Checking authentication...</div>;
  }
  
  if (error) {
    return <div className="auth-status error">Auth error: {error.message}</div>;
  }
  
  if (isAuthenticated) {
    return <div className="auth-status authenticated">Authenticated</div>;
  }
  
  return <div className="auth-status unauthenticated">Not authenticated</div>;
};
```

## Integration with UI Libraries

The components in Magic Button Auth are designed to be customizable and integrate with popular UI libraries:

### Material UI Example

```tsx
import React from 'react';
import { useAuth, LoginForm } from '@magicbutton.cloud/auth';
import { 
  Button, 
  TextField, 
  Container, 
  Typography, 
  Box, 
  Alert 
} from '@mui/material';

const MaterialLoginPage = () => {
  return (
    <Container maxWidth="sm">
      <Box 
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        
        <LoginForm
          onSuccess={() => window.location.href = '/dashboard'}
          onError={(error) => console.error(error)}
          renderFields={(fields, handleChange) => (
            <Box sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={fields.email}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={fields.password}
                onChange={handleChange}
              />
            </Box>
          )}
          buttonClassName="" // We'll provide a custom button below
        >
          {(formProps) => (
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={formProps.isLoading}
            >
              {formProps.isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          )}
        </LoginForm>
      </Box>
    </Container>
  );
};
```

### Tailwind CSS Example

```tsx
// Using the LoginForm component with Tailwind CSS classes
<LoginForm
  className="mt-8 space-y-6"
  buttonClassName="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  inputClassName="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
  labelClassName="sr-only"
  errorClassName="text-red-500 text-sm mt-1"
  onSuccess={() => navigate('/dashboard')}
/>
```

## Next Steps

Now that you understand the components available in Magic Button Auth, you can explore:

- [Hooks](hooks): Learn about the React hooks provided by the library