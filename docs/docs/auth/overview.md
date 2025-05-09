---
sidebar_position: 1
---

# Magic Button Auth

A comprehensive authentication and authorization solution for TypeScript and React applications, providing seamless identity management, access control, and security features.

## Features

- 🔒 **Secure Authentication**: Built-in support for various authentication methods (JWT, OAuth, etc.)
- 🛡️ **Role-Based Access Control (RBAC)**: Fine-grained permission management
- 🔑 **Token Management**: Automatic handling of token storage, refresh, and validation
- 🧩 **React Integration**: React hooks and components for authentication flows
- 🌐 **SSR Compatibility**: Works with server-side rendering environments
- 📱 **Multiple Providers**: Support for multiple authentication providers
- 👤 **User Management**: User registration, login, and profile management
- 📊 **Session Management**: Track and manage user sessions

## Why Magic Button Auth?

### Problem

Authentication and authorization in modern applications present several challenges:

- **Security**: Implementing secure authentication flows without vulnerabilities
- **Consistency**: Maintaining consistent authentication state across the application
- **Flexibility**: Supporting different authentication methods
- **Maintenance**: Keeping up with security best practices and updates
- **User Experience**: Providing a seamless login and authorization experience
- **Integration**: Connecting with various identity providers

### Solution

Magic Button Auth addresses these challenges with a comprehensive authentication library that provides:

- **End-to-end type safety** with TypeScript and Zod
- **Pluggable authentication methods** (JWT, OAuth, etc.)
- **Built-in components** for common authentication UI elements
- **Secure token management** with automatic refresh
- **Role-based access control** for fine-grained permissions
- **React hooks** for easy integration with React applications

## Core Concepts

Magic Button Auth is built around a few key concepts:

### Authentication Provider

The `AuthProvider` is a React context provider that manages authentication state and provides methods for login, logout, and other authentication operations. It wraps your application and makes authentication functionality available throughout your component tree.

### Authentication Context

The authentication context contains the current authentication state, including the user object, tokens, and authentication status. It also provides methods for authentication operations.

### Hooks

Custom React hooks provide easy access to authentication functionality:

- **useAuth**: Access authentication state and methods
- **useAccessControl**: Check user roles and permissions

### Role-Based Access Control

The library includes a built-in role-based access control system, allowing you to restrict access to resources based on user roles and permissions.

### Storage Providers

Pluggable storage providers allow you to choose how authentication tokens are stored:

- **localStorage**: Persist tokens between sessions
- **sessionStorage**: Store tokens for the current session only
- **memory**: Keep tokens in memory (no persistence)
- **cookie**: Store tokens in HTTP cookies

## Quick Example

```tsx
import { AuthProvider, useAuth, ProtectedRoute } from '@magicbutton.cloud/auth';

// Wrap your application with the provider
function App() {
  return (
    <AuthProvider 
      config={{
        authUrl: 'https://auth.example.com',
        clientId: 'your-client-id',
      }}
    >
      <AppRoutes />
    </AuthProvider>
  );
}

// Use the auth hook in your components
function LoginButton() {
  const { isAuthenticated, login, logout, user } = useAuth();
  
  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user.name}!</p>
        <button onClick={logout}>Log out</button>
      </div>
    );
  }
  
  return <button onClick={login}>Log in</button>;
}

// Protect routes based on authentication state
function AppRoutes() {
  return (
    <Router>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/public" element={<PublicPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRoles="admin">
            <AdminPage />
          </ProtectedRoute>
        } 
      />
    </Router>
  );
}
```

## Next Steps

- [Installation](installation): Install Magic Button Auth in your project
- [Quick Start](quick-start): Get started with a simple example
- [Authentication](authentication): Learn about authentication methods
- [Access Control](access-control): Secure your application with role-based access control
- [Components](components): Use built-in authentication components
- [Hooks](hooks): Leverage React hooks for authentication