---
sidebar_position: 3
---

# Quick Start

This guide will help you get started with Magic Button Auth by walking through a simple example. We'll create a basic React application with authentication and protected routes.

## Setting Up Your Project

First, make sure you have [installed Magic Button Auth](installation). Then, let's set up the basic structure for our application.

## Configuring the Auth Provider

The first step is to wrap your application with the `AuthProvider` component:

```tsx
// App.tsx
import React from 'react';
import { AuthProvider } from '@magicbutton.cloud/auth';

const App = () => {
  return (
    <AuthProvider
      config={{
        // Authentication service URL
        authUrl: 'https://auth.example.com',
        
        // Your application's client ID
        clientId: 'your-client-id',
        
        // Optional: client secret (for confidential clients)
        // clientSecret: 'your-client-secret',
        
        // Optional: redirect URL after login (for OAuth)
        // redirectUrl: 'https://yourapp.com/callback',
        
        // Optional: storage type (default: 'localStorage')
        storage: 'localStorage',
        
        // Optional: authentication method (default: 'jwt')
        method: 'jwt',
        
        // Optional: automatically refresh tokens (default: true)
        autoRefresh: true,
        
        // Optional: requested scopes (for OAuth)
        // scope: 'openid profile email',
        
        // Optional: refresh buffer in seconds (default: 300)
        refreshBuffer: 300,
      }}
    >
      {/* Your application components */}
      <MainContent />
    </AuthProvider>
  );
};

export default App;
```

## Using Authentication in Components

Now you can use the `useAuth` hook to access authentication functionality in your components:

```tsx
// LoginPage.tsx
import React, { useState } from 'react';
import { useAuth, LoginForm } from '@magicbutton.cloud/auth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }
  
  return (
    <div className="login-page">
      <h1>Login</h1>
      
      {error && <div className="error">{error}</div>}
      
      <LoginForm
        onSuccess={() => navigate('/dashboard')}
        onError={(err) => setError(err.message)}
        className="login-form"
        buttonClassName="login-button"
        inputClassName="login-input"
      />
    </div>
  );
};

export default LoginPage;
```

## Creating a User Dashboard

Let's create a dashboard that's only accessible to authenticated users:

```tsx
// Dashboard.tsx
import React from 'react';
import { useAuth } from '@magicbutton.cloud/auth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="user-info">
        <h2>Welcome, {user?.name || 'User'}!</h2>
        <p>Email: {user?.email}</p>
        
        {user?.roles && user.roles.length > 0 && (
          <div>
            <h3>Your Roles:</h3>
            <ul>
              {user.roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
```

## Setting Up Protected Routes

To protect routes based on authentication status or user roles, use the `ProtectedRoute` component:

```tsx
// Routes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@magicbutton.cloud/auth';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import PublicPage from './pages/PublicPage';
import NotFound from './pages/NotFound';
import AccessDenied from './pages/AccessDenied';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/public" element={<PublicPage />} />
      
      {/* Protected routes - require authentication */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute fallback={<Navigate to="/login" />}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Protected routes with role requirements */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            requiredRoles="admin"
            fallback={<AccessDenied />}
          >
            <AdminPanel />
          </ProtectedRoute>
        }
      />
      
      {/* Protected route with permission requirements */}
      <Route
        path="/users"
        element={
          <ProtectedRoute
            requiredPermissions={['users:read']}
            fallback={<AccessDenied />}
          >
            <UsersPage />
          </ProtectedRoute>
        }
      />
      
      {/* Default route */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
```

## Checking Permissions in Components

You can use the `useAccessControl` hook to check user roles and permissions within your components:

```tsx
// AdminButton.tsx
import React from 'react';
import { useAccessControl } from '@magicbutton.cloud/auth';
import { Link } from 'react-router-dom';

const AdminButton = () => {
  const { hasRole } = useAccessControl();
  
  // Only show the button if the user has the admin role
  if (!hasRole('admin')) {
    return null;
  }
  
  return (
    <Link to="/admin" className="admin-button">
      Admin Panel
    </Link>
  );
};

export default AdminButton;
```

## Creating a Custom Login Form

If you prefer to create your own login form instead of using the built-in component, you can use the `useAuth` hook directly:

```tsx
// CustomLoginForm.tsx
import React, { useState, FormEvent } from 'react';
import { useAuth } from '@magicbutton.cloud/auth';

const CustomLoginForm = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login({ email, password });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default CustomLoginForm;
```

## Putting It All Together

Finally, let's put everything together in our main application file:

```tsx
// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@magicbutton.cloud/auth';
import AppRoutes from './Routes';
import './styles.css';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider
        config={{
          authUrl: 'https://auth.example.com',
          clientId: 'your-client-id',
          storage: 'localStorage',
        }}
      >
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Next Steps

Now that you have a basic authentication flow set up, you can explore more advanced features:

- [Authentication Methods](authentication): Learn about different authentication methods
- [Access Control](access-control): Implement fine-grained access control
- [Components](components): Use built-in authentication components
- [Hooks](hooks): Leverage React hooks for authentication