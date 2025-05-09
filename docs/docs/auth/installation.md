---
sidebar_position: 2
---

# Installation

Getting started with Magic Button Auth is straightforward. This guide will walk you through the installation process and help you set up your project to use the library.

## Prerequisites

Before installing Magic Button Auth, make sure you have:

- Node.js (version 14 or higher)
- npm, yarn, or pnpm
- A React application (version 16.8 or higher)

## Installation Steps

You can install Magic Button Auth using your preferred package manager:

### Using npm

```bash
npm install @magicbutton.cloud/auth
```

### Using yarn

```bash
yarn add @magicbutton.cloud/auth
```

### Using pnpm

```bash
pnpm add @magicbutton.cloud/auth
```

## Dependencies

Magic Button Auth has the following dependencies, which will be installed automatically:

- **react**: Peer dependency (16.8.0 or higher)
- **react-dom**: Peer dependency (16.8.0 or higher)
- **zod**: For schema validation and type safety
- **jose**: For JWT handling and validation
- **uuid**: For generating unique identifiers

## TypeScript Configuration

Magic Button Auth is built with TypeScript and provides full type safety. We recommend the following TypeScript configuration in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "jsx": "react-jsx",
    "skipLibCheck": true
  }
}
```

## Verifying Installation

After installing Magic Button Auth, you can verify the installation by creating a simple test component:

```tsx
// test.tsx
import { AuthProvider, useAuth } from '@magicbutton.cloud/auth';

// If this code compiles without errors, the installation was successful
const TestComponent = () => {
  const { isAuthenticated } = useAuth();
  return <div>{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>;
};

const TestApp = () => {
  return (
    <AuthProvider 
      config={{
        authUrl: 'https://auth.example.com',
        clientId: 'test-client-id',
      }}
    >
      <TestComponent />
    </AuthProvider>
  );
};

export default TestApp;
```

## Setup with Next.js

For Next.js applications, you'll need to ensure the authentication provider doesn't try to access browser APIs during server-side rendering:

```tsx
// _app.tsx
import { useState, useEffect } from 'react';
import { AppProps } from 'next/app';
import { AuthProvider } from '@magicbutton.cloud/auth';

function MyApp({ Component, pageProps }: AppProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render AuthProvider on the client-side
  return (
    <>
      {isMounted ? (
        <AuthProvider 
          config={{
            authUrl: process.env.NEXT_PUBLIC_AUTH_URL!,
            clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!,
          }}
        >
          <Component {...pageProps} />
        </AuthProvider>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}

export default MyApp;
```

## Setup with Vite

For Vite applications, the setup is straightforward:

```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from '@magicbutton.cloud/auth';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider 
      config={{
        authUrl: import.meta.env.VITE_AUTH_URL,
        clientId: import.meta.env.VITE_AUTH_CLIENT_ID,
      }}
    >
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
```

## Next Steps

Now that you have Magic Button Auth installed, you can proceed to the [Quick Start](quick-start) guide to learn how to use it in your application.