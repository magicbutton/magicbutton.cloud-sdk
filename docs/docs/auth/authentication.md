---
sidebar_position: 4
---

# Authentication Methods

Magic Button Auth supports multiple authentication methods to fit different application needs. This page explains the various authentication methods available and how to configure them.

## Supported Authentication Methods

The library currently supports these authentication methods:

1. **JWT Authentication**: Uses JSON Web Tokens for authentication
2. **OAuth Authentication**: Implements the OAuth 2.0 protocol for third-party authentication
3. **Custom Authentication**: Allows you to implement custom authentication logic

## JWT Authentication

JWT (JSON Web Token) authentication is a token-based stateless authentication mechanism that works by issuing a signed token to the client upon successful authentication.

### How It Works

1. The user provides credentials (username/password)
2. The server validates the credentials and issues a JWT
3. The client stores the JWT and includes it in subsequent requests
4. The server validates the JWT on each request

### Configuration

```tsx
<AuthProvider
  config={{
    authUrl: 'https://auth.example.com',
    clientId: 'your-client-id',
    method: 'jwt', // Specify JWT authentication
    storage: 'localStorage', // Store tokens in localStorage
    autoRefresh: true, // Automatically refresh tokens before expiry
    refreshBuffer: 300, // Refresh token 5 minutes before expiry
  }}
>
  <App />
</AuthProvider>
```

### Token Storage

The JWT is stored according to the `storage` configuration:

- **localStorage**: Persists across sessions but vulnerable to XSS
- **sessionStorage**: Cleared when the browser session ends
- **memory**: Stored in memory only (lost on page refresh)
- **cookie**: Stored in HTTP cookies (can be made HTTP-only)

### Token Refresh

JWT authentication includes automatic token refresh. When the token is about to expire (based on the `refreshBuffer` setting), the library will attempt to refresh it using the refresh token.

```tsx
// Example of manually refreshing a token
const { getAccessToken } = useAuth();

const fetchData = async () => {
  // This will automatically refresh the token if needed
  const token = await getAccessToken();
  
  // Use the token for API requests
  const response = await fetch('https://api.example.com/data', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

## OAuth Authentication

OAuth authentication allows users to authenticate using third-party providers like Google, Facebook, Microsoft, etc.

### How It Works

1. The user is redirected to the OAuth provider's login page
2. After successful authentication, the provider redirects back to your application with an authorization code
3. The application exchanges the code for access and refresh tokens
4. The application uses these tokens for subsequent requests

### Configuration

```tsx
<AuthProvider
  config={{
    authUrl: 'https://auth.example.com',
    clientId: 'your-client-id',
    method: 'oauth', // Specify OAuth authentication
    redirectUrl: 'https://yourapp.com/callback', // Redirect URL after authentication
    scope: 'openid profile email', // Requested scopes
    storage: 'localStorage', // Token storage method
  }}
>
  <App />
</AuthProvider>
```

### OAuth Flow

The OAuth authentication flow involves redirection to the identity provider's login page:

```tsx
// Example of initiating OAuth login
const LoginButton = () => {
  const { login } = useAuth();
  
  const handleLogin = async () => {
    // This will redirect to the OAuth provider's login page
    await login();
    
    // Control will return here after successful authentication
    // and the redirect back to your application
  };
  
  return <button onClick={handleLogin}>Login with OAuth</button>;
};
```

### Handling Redirects

For OAuth authentication, you need to handle the redirect from the OAuth provider. The auth library automatically processes the authorization code in the URL during initialization.

## Custom Authentication

For scenarios where the built-in authentication methods don't meet your needs, you can implement custom authentication.

### Creating a Custom Auth Service

```tsx
// custom-auth-service.ts
import { AuthConfig, StorageProvider } from '@magicbutton.cloud/auth';

export const customAuthService = (config: AuthConfig, storage: StorageProvider) => {
  // Implement authentication methods
  const initialize = async () => {
    // Your initialization logic
  };
  
  const login = async (credentials?: Record<string, any>) => {
    // Your login logic
  };
  
  const logout = async () => {
    // Your logout logic
  };
  
  const refreshToken = async (token: string) => {
    // Your token refresh logic
  };
  
  // Return the service interface
  return {
    initialize,
    login,
    logout,
    refreshToken,
    // Other required methods
  };
};
```

### Using a Custom Auth Service

```tsx
// Create a custom provider that uses your service
import React, { createContext, useReducer, useEffect } from 'react';
import { AuthContextType, AuthProviderProps } from '@magicbutton.cloud/auth';
import { customAuthService } from './custom-auth-service';

// Create a context
export const CustomAuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const CustomAuthProvider: React.FC<AuthProviderProps> = ({
  config,
  children,
}) => {
  // ... Implement provider using your custom service
  const authService = customAuthService(config, storageProvider);
  
  // Return the provider
  return (
    <CustomAuthContext.Provider value={contextValue}>
      {children}
    </CustomAuthContext.Provider>
  );
};
```

## Authentication Events

The auth library provides hooks to listen for authentication events:

```tsx
// Example of using authentication events
import { useEffect } from 'react';
import { useAuth } from '@magicbutton.cloud/auth';

const AuthEvents = () => {
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User logged in:', user);
      // Track login, initialize services, etc.
    } else {
      console.log('User logged out');
      // Clean up resources, redirect, etc.
    }
  }, [isAuthenticated, user]);
  
  return null;
};
```

## Best Practices

### Security Considerations

1. **JWT Storage**: 
   - Use `cookie` storage with HTTP-only cookies for the most secure option
   - Avoid `localStorage` in high-security applications

2. **Token Refresh**:
   - Enable `autoRefresh` to ensure tokens are always valid
   - Implement proper error handling for refresh failures

3. **CSRF Protection**:
   - For cookie-based storage, implement CSRF protection on your server

4. **State Management**:
   - In OAuth flows, always validate the state parameter to prevent CSRF attacks

### Performance Considerations

1. **Token Validation**:
   - Validate tokens locally when possible to reduce server load
   - Use the built-in `verifyToken` utility for local validation

2. **Token Size**:
   - Keep tokens small to reduce bandwidth and storage requirements
   - Include only necessary claims in your JWTs

3. **Storage Choice**:
   - For SPAs, `sessionStorage` offers a good balance of security and convenience
   - For server-rendered apps, `cookie` storage works well with SSR

## Next Steps

Now that you understand the different authentication methods, you can proceed to:

- [Access Control](access-control): Learn about role-based access control
- [Components](components): Use built-in authentication components
- [Hooks](hooks): Leverage React hooks for authentication