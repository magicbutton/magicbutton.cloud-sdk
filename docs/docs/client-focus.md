---
sidebar_position: 2
---

# Client-Focused Framework

Magic Button Cloud has evolved to embrace a client-focused framework approach that prioritizes ease of use, flexibility, and seamless integration for client applications. This approach empowers developers to build robust, distributed applications with minimal overhead.

## Client-First Philosophy

Our client-focused approach is built on several core principles:

### 1. Simplified Client Integration

We've designed our libraries with client applications as the primary focus, making it effortless to integrate Magic Button into your existing applications:

- **Minimal Dependencies**: The client library has a small footprint with few external dependencies
- **Flexible Integration**: Adapts to your existing application architecture rather than forcing a specific pattern
- **Progressive Adoption**: You can adopt features incrementally, starting with basic functionality and adding more as needed

### 2. Type Safety Without Compromise

We provide complete type safety throughout the communication chain without sacrificing developer experience:

- **End-to-End Type Safety**: From client to server and back, with full TypeScript support
- **Automatic Type Inference**: Types are inferred from your contracts, reducing boilerplate
- **Runtime Validation**: Zod schemas ensure runtime validation matches compile-time types

### 3. Transport Agnosticism

Our framework doesn't dictate your communication protocol:

- **Pluggable Transports**: Built-in support for various transport mechanisms (HTTP, WebSockets, etc.)
- **Custom Transport Creation**: Easily create your own transport adapters for specialized needs
- **Transport Switching**: Change transports without modifying your application logic

## Key Client Features

### Smart Client Configuration

The Magic Button client includes intelligent configuration capabilities:

```typescript
// Simple client setup with smart defaults
const client = new Client();

// Or with custom configuration
const client = new Client({
  transport: new WebSocketTransport(),
  middleware: [loggingMiddleware, authMiddleware],
  defaultTimeout: 5000,
  retryOptions: { maxRetries: 3, backoffFactor: 1.5 }
});
```

### Simplified Request Handling

Send requests with full type safety and convenient options:

```typescript
// Type-safe request with inferred response type
const response = await client.request('getUser', { userId: '123' });

// With additional options
const response = await client.request('getUser', { userId: '123' }, {
  timeout: 10000,
  retry: true,
  context: { traceId: 'abc-123' }
});
```

### Event Subscription

Subscribe to events with type-safe handlers:

```typescript
// Type-safe event subscription
client.subscribe('userUpdated', (data) => {
  // data is fully typed based on your contract
  console.log(`User ${data.userId} was updated`);
});
```

### Built-in Error Handling

Robust error handling with typed errors and automatic retries:

```typescript
try {
  const response = await client.request('riskyOperation', data);
} catch (error) {
  if (error instanceof RequestTimeoutError) {
    // Handle timeout specifically
  } else if (error instanceof AuthenticationError) {
    // Handle auth error
  } else {
    // Handle other errors
  }
}
```

## Client-Side Development Experience

### Optimized Bundle Size

The Magic Button client library is optimized for client-side applications:

- **Tree Shaking**: Only include the functionality you actually use
- **Modular Design**: Import only the specific components you need
- **Minimal Dependencies**: Keep your bundle size small

### Developer Tools

Enhance your development workflow with our client-side developer tools:

- **Request Inspector**: Debug requests and responses in real-time
- **Event Monitor**: Track event subscriptions and publications
- **Connection Manager**: Monitor and manage client connectivity

### Mobile and Browser Support

Magic Button client libraries work seamlessly across platforms:

- **Browser Compatibility**: Works in all modern browsers with appropriate polyfills for older ones
- **React Native Support**: First-class support for React Native applications
- **Offline Capabilities**: Queue operations when offline and sync when connection is restored

## Client Integration Patterns

### React Integration

Seamless integration with React applications:

```tsx
// Client provider for React applications
function App() {
  return (
    <MessagingClientProvider client={client}>
      <YourApplication />
    </MessagingClientProvider>
  );
}

// Custom hooks for easy access
function UserProfile({ userId }) {
  const { data, loading, error } = useRequest('getUser', { userId });
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <Profile user={data} />;
}
```

### Angular Integration

Integration with Angular applications:

```typescript
// Angular service for Magic Button client
@Injectable({ providedIn: 'root' })
export class MessagingService {
  private client = new Client();
  
  async getUser(userId: string) {
    return this.client.request('getUser', { userId });
  }
  
  subscribeToUserUpdates(callback: (data: UserUpdatedEvent) => void) {
    return this.client.subscribe('userUpdated', callback);
  }
}
```

### Vue Integration

Integration with Vue applications:

```typescript
// Vue composable for Magic Button client
export function useMessaging() {
  const client = inject('messagingClient');
  
  function useRequest(requestName, payload) {
    const data = ref(null);
    const loading = ref(true);
    const error = ref(null);
    
    client.request(requestName, payload)
      .then(response => {
        data.value = response;
        loading.value = false;
      })
      .catch(err => {
        error.value = err;
        loading.value = false;
      });
      
    return { data, loading, error };
  }
  
  return { client, useRequest };
}
```

## Getting Started with Client-Focused Development

To start using the client-focused approach:

1. [Install the Magic Button Messaging library](messaging/installation.md)
2. [Define your contracts](messaging/core-concepts/contracts.md)
3. [Set up your client](messaging/api/client.md)
4. [Start making requests and subscribing to events](messaging/quick-start.md)

Explore our [Client Integration Examples](messaging/examples.md) for more detailed implementation patterns.