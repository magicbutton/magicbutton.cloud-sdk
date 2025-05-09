---
sidebar_position: 3
---

# Transport Adapter API Reference

This page provides detailed API reference for transport adapters in Magic Button Messaging, including the `TransportAdapter` interface and the built-in `InMemoryTransport` implementation.

## TransportAdapter Interface

The `TransportAdapter` interface defines the contract that all transport implementations must follow. It abstracts the underlying communication protocol, allowing the client and server to communicate without knowing the specific transport details.

### Type Parameters

- `TEvents` - Type of events this transport can handle (extends `Record<string, any>`)
- `TRequests` - Type of requests this transport can process (extends `Record<string, any>`)

### Interface Definition

```typescript
export interface TransportAdapter<TEvents extends Record<string, any>, TRequests extends Record<string, any>> {
  // Connection Management
  connect(connectionString: string): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConnectionString(): string;
  
  // Event Handling
  emit<E extends string & keyof TEvents>(
    event: E, 
    payload: any, 
    context?: MessageContext
  ): Promise<void>;
  
  on<E extends string & keyof TEvents>(
    event: E, 
    handler: (payload: any, context: MessageContext) => void, 
    subscriptionContext?: MessageContext
  ): void;
  
  off<E extends string & keyof TEvents>(
    event: E, 
    handler: (payload: any, context: MessageContext) => void
  ): void;
  
  // Request Processing
  request<R extends string & keyof TRequests>(
    requestType: R, 
    payload: any, 
    context?: MessageContext
  ): Promise<any>;
  
  handleRequest<R extends string & keyof TRequests>(
    requestType: R, 
    handler: (payload: any, context: MessageContext) => Promise<any>
  ): void;
  
  // Authentication
  login(credentials: any): Promise<AuthResult>;
  logout(): Promise<void>;
}
```

## Connection Methods

### connect

```typescript
connect(connectionString: string): Promise<void>
```

Establishes a connection to the transport.

#### Parameters

- `connectionString` - The connection string to connect to

#### Returns

- A promise that resolves when connected successfully

#### Example

```typescript
await transport.connect("memory://example-service");
```

### disconnect

```typescript
disconnect(): Promise<void>
```

Disconnects from the transport.

#### Returns

- A promise that resolves when disconnected successfully

#### Example

```typescript
await transport.disconnect();
```

### isConnected

```typescript
isConnected(): boolean
```

Checks if the transport is currently connected.

#### Returns

- `true` if connected, `false` otherwise

#### Example

```typescript
if (transport.isConnected()) {
  console.log("Transport is connected");
} else {
  console.log("Transport is disconnected");
}
```

### getConnectionString

```typescript
getConnectionString(): string
```

Gets the current connection string.

#### Returns

- The connection string

#### Example

```typescript
const connectionString = transport.getConnectionString();
console.log(`Connected to: ${connectionString}`);
```

## Event Methods

### emit

```typescript
emit<E extends string & keyof TEvents>(
  event: E, 
  payload: any, 
  context?: MessageContext
): Promise<void>
```

Emits an event through the transport.

#### Type Parameters

- `E` - The event type, must be a key of `TEvents`

#### Parameters

- `event` - The event type to emit
- `payload` - The event payload
- `context` - (Optional) Additional context for the event

#### Returns

- A promise that resolves when the event has been emitted

#### Example

```typescript
await transport.emit("userUpdated", {
  id: "user-123",
  name: "John Doe",
  updatedAt: Date.now(),
});
```

### on

```typescript
on<E extends string & keyof TEvents>(
  event: E, 
  handler: (payload: any, context: MessageContext) => void, 
  subscriptionContext?: MessageContext
): void
```

Registers a handler for a specific event type.

#### Type Parameters

- `E` - The event type, must be a key of `TEvents`

#### Parameters

- `event` - The event type to listen for
- `handler` - The function to call when the event is received
- `subscriptionContext` - (Optional) Additional context for the subscription

#### Example

```typescript
transport.on("userCreated", (payload, context) => {
  console.log(`User created: ${payload.id}`);
  console.log(`Event context: ${JSON.stringify(context)}`);
});
```

### off

```typescript
off<E extends string & keyof TEvents>(
  event: E, 
  handler: (payload: any, context: MessageContext) => void
): void
```

Unregisters a handler for a specific event type.

#### Type Parameters

- `E` - The event type, must be a key of `TEvents`

#### Parameters

- `event` - The event type to stop listening for
- `handler` - The function to unregister

#### Example

```typescript
// Define a handler function
const handleUserCreated = (payload, context) => {
  console.log(`User created: ${payload.id}`);
};

// Register the handler
transport.on("userCreated", handleUserCreated);

// Later, unregister the handler
transport.off("userCreated", handleUserCreated);
```

## Request Methods

### request

```typescript
request<R extends string & keyof TRequests>(
  requestType: R, 
  payload: any, 
  context?: MessageContext
): Promise<any>
```

Sends a request through the transport and awaits a response.

#### Type Parameters

- `R` - The request type, must be a key of `TRequests`

#### Parameters

- `requestType` - The type of request to send
- `payload` - The request payload
- `context` - (Optional) Additional context for the request

#### Returns

- A promise that resolves with the response from the server

#### Example

```typescript
try {
  const user = await transport.request("getUserById", {
    id: "user-123",
  });
  
  console.log("User:", user);
} catch (error) {
  console.error("Error getting user:", error);
}
```

### handleRequest

```typescript
handleRequest<R extends string & keyof TRequests>(
  requestType: R, 
  handler: (payload: any, context: MessageContext) => Promise<any>
): void
```

Registers a handler for a specific request type.

#### Type Parameters

- `R` - The request type, must be a key of `TRequests`

#### Parameters

- `requestType` - The type of request to handle
- `handler` - The function to call when a request of this type is received

#### Example

```typescript
transport.handleRequest("getOrderById", async (payload, context) => {
  const { id } = payload;
  
  // Get order from database
  const order = await orderRepository.findById(id);
  
  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }
  
  return order;
});
```

## Authentication Methods

### login

```typescript
login(credentials: any): Promise<AuthResult>
```

Authenticates with the transport.

#### Parameters

- `credentials` - The authentication credentials

#### Returns

- A promise that resolves with the authentication result

#### Example

```typescript
const authResult = await transport.login({
  username: "user@example.com",
  password: "password123",
});

if (authResult.success) {
  console.log("Authentication successful!");
  console.log("Token:", authResult.token);
  console.log("User:", authResult.user);
} else {
  console.error("Authentication failed:", authResult.error);
}
```

### logout

```typescript
logout(): Promise<void>
```

Logs out from the transport.

#### Returns

- A promise that resolves when logged out successfully

#### Example

```typescript
await transport.logout();
```

## AuthResult Interface

The `AuthResult` interface represents the result of an authentication attempt:

```typescript
export interface AuthResult {
  success: boolean
  token?: string
  expiresAt?: number
  user?: {
    id: string
    username: string
    [key: string]: any
  }
  error?: {
    code: string
    message: string
    [key: string]: any
  }
}
```

- `success` - Whether authentication was successful
- `token` - Authentication token (if successful)
- `expiresAt` - Token expiration timestamp in milliseconds (if successful)
- `user` - User information (if successful)
- `error` - Error information (if unsuccessful)

## InMemoryTransport Class

Magic Button Messaging provides a built-in `InMemoryTransport` implementation for in-memory communication. This is useful for testing and development purposes.

### Type Parameters

- `TEvents` - Type of events this transport can handle (extends `Record<string, any>`)
- `TRequests` - Type of requests this transport can process (extends `Record<string, any>`)

### Constructor

```typescript
constructor()
```

Creates a new in-memory transport instance.

#### Example

```typescript
import { InMemoryTransport } from "@magicbutton.cloud/messaging";

// Create an in-memory transport
const transport = new InMemoryTransport();
```

### Connection Handling

The `InMemoryTransport` uses simple string-based connection strings in the format `memory://service-name`. Multiple transports can connect to the same service name to communicate with each other.

#### Example

```typescript
// Server transport
const serverTransport = new InMemoryTransport();
await serverTransport.connect("memory://example-service");

// Client transport
const clientTransport = new InMemoryTransport();
await clientTransport.connect("memory://example-service");

// Now the client and server can communicate with each other
```

### Test User

The `InMemoryTransport` includes a test user for authentication:

```typescript
username: "test"
password: "password"
id: "user-1"
```

#### Example

```typescript
// Authenticate with the test user
const authResult = await transport.login({
  username: "test",
  password: "password",
});

console.log(authResult.success); // true
console.log(authResult.user.id); // "user-1"
```

## Creating Custom Transport Adapters

You can create custom transport adapters by implementing the `TransportAdapter` interface:

```typescript
import { TransportAdapter, MessageContext, AuthResult } from "@magicbutton.cloud/messaging";

export class WebSocketTransport<TEvents extends Record<string, any>, TRequests extends Record<string, any>>
  implements TransportAdapter<TEvents, TRequests> {
  
  private socket: WebSocket | null = null;
  private connected = false;
  private connectionString = "";
  private eventHandlers = new Map<string, Set<(payload: any, context: MessageContext) => void>>();
  private pendingRequests = new Map<string, { 
    resolve: (value: any) => void, 
    reject: (reason: any) => void 
  }>();
  
  async connect(connectionString: string): Promise<void> {
    if (this.connected) return;
    
    this.connectionString = connectionString;
    
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(connectionString);
        
        this.socket.onopen = () => {
          this.connected = true;
          resolve();
        };
        
        this.socket.onerror = (error) => {
          reject(new Error(`WebSocket error: ${error}`));
        };
        
        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data.toString());
            this.handleMessage(message);
          } catch (error) {
            console.error("Error handling WebSocket message:", error);
          }
        };
        
        this.socket.onclose = () => {
          this.connected = false;
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  
  async disconnect(): Promise<void> {
    if (!this.connected || !this.socket) return;
    
    return new Promise((resolve) => {
      this.socket!.onclose = () => {
        this.connected = false;
        this.socket = null;
        resolve();
      };
      
      this.socket!.close();
    });
  }
  
  isConnected(): boolean {
    return this.connected;
  }
  
  getConnectionString(): string {
    return this.connectionString;
  }
  
  async emit<E extends string & keyof TEvents>(
    event: E, 
    payload: any, 
    context: MessageContext = {}
  ): Promise<void> {
    if (!this.connected || !this.socket) {
      throw new Error("Not connected");
    }
    
    const message = {
      type: "event",
      event,
      payload,
      context,
    };
    
    this.socket.send(JSON.stringify(message));
  }
  
  on<E extends string & keyof TEvents>(
    event: E, 
    handler: (payload: any, context: MessageContext) => void
  ): void {
    if (!this.eventHandlers.has(event as string)) {
      this.eventHandlers.set(event as string, new Set());
    }
    
    this.eventHandlers.get(event as string)!.add(handler);
  }
  
  off<E extends string & keyof TEvents>(
    event: E, 
    handler: (payload: any, context: MessageContext) => void
  ): void {
    const handlers = this.eventHandlers.get(event as string);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event as string);
      }
    }
  }
  
  async request<R extends string & keyof TRequests>(
    requestType: R, 
    payload: any, 
    context: MessageContext = {}
  ): Promise<any> {
    if (!this.connected || !this.socket) {
      throw new Error("Not connected");
    }
    
    const requestId = crypto.randomUUID();
    
    return new Promise((resolve, reject) => {
      // Store the promise resolvers
      this.pendingRequests.set(requestId, { resolve, reject });
      
      // Send the request
      const message = {
        type: "request",
        requestId,
        requestType,
        payload,
        context,
      };
      
      this.socket!.send(JSON.stringify(message));
      
      // Set a timeout for the request
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error(`Request timed out: ${requestType}`));
        }
      }, 30000); // 30 second timeout
    });
  }
  
  handleRequest<R extends string & keyof TRequests>(
    requestType: R, 
    handler: (payload: any, context: MessageContext) => Promise<any>
  ): void {
    // Register a handler for this request type
    this.on(`$request:${requestType}` as any, async (request, context) => {
      try {
        const result = await handler(request.payload, context);
        
        // Send response
        const response = {
          type: "response",
          requestId: request.requestId,
          success: true,
          data: result,
          context,
        };
        
        this.socket!.send(JSON.stringify(response));
      } catch (error) {
        // Send error response
        const response = {
          type: "response",
          requestId: request.requestId,
          success: false,
          error: {
            code: error.code || "UNKNOWN_ERROR",
            message: error.message || "Unknown error",
            details: error.details,
          },
          context,
        };
        
        this.socket!.send(JSON.stringify(response));
      }
    });
  }
  
  private handleMessage(message: any): void {
    if (message.type === "event") {
      // Handle incoming event
      const handlers = this.eventHandlers.get(message.event);
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(message.payload, message.context || {});
          } catch (error) {
            console.error(`Error in event handler for ${message.event}:`, error);
          }
        }
      }
    } else if (message.type === "request") {
      // Handle incoming request
      const handlers = this.eventHandlers.get(`$request:${message.requestType}`);
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(message, message.context || {});
          } catch (error) {
            console.error(`Error in request handler for ${message.requestType}:`, error);
          }
        }
      }
    } else if (message.type === "response") {
      // Handle incoming response
      const pendingRequest = this.pendingRequests.get(message.requestId);
      if (pendingRequest) {
        this.pendingRequests.delete(message.requestId);
        
        if (message.success) {
          pendingRequest.resolve(message.data);
        } else {
          const error = new Error(message.error.message);
          error.code = message.error.code;
          error.details = message.error.details;
          pendingRequest.reject(error);
        }
      }
    }
  }
  
  async login(credentials: any): Promise<AuthResult> {
    // Implement your own authentication logic
    if (credentials.username === "admin" && credentials.password === "password") {
      return {
        success: true,
        token: `fake-token-${Date.now()}`,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        user: {
          id: "user-1",
          username: "admin",
          roles: ["admin"],
        },
      };
    } else {
      return {
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid username or password",
        },
      };
    }
  }
  
  async logout(): Promise<void> {
    // Implement your own logout logic
    console.log("Logged out");
  }
}
```

## createTransportAdapter Function

Magic Button Messaging provides a `createTransportAdapter` function to help with type safety:

```typescript
import { createTransportAdapter } from "@magicbutton.cloud/messaging";

// Create a transport adapter
const transport = createTransportAdapter(new WebSocketTransport());
```

This function simply returns the passed transport adapter but helps TypeScript with type inference.

## Complete Example

Here's a complete example of using the built-in `InMemoryTransport`:

```typescript
import { InMemoryTransport, MessageContext } from "@magicbutton.cloud/messaging";

async function main() {
  // Create two in-memory transports
  const transport1 = new InMemoryTransport();
  const transport2 = new InMemoryTransport();
  
  // Connect both to the same service
  await transport1.connect("memory://example-service");
  await transport2.connect("memory://example-service");
  
  console.log("Transports connected");
  
  // Set up event handlers on transport2
  transport2.on("greeting", (payload, context) => {
    console.log(`Received greeting: ${payload.message}`);
    console.log(`From: ${context.source}`);
    console.log(`Timestamp: ${new Date(context.timestamp).toISOString()}`);
  });
  
  // Set up request handler on transport2
  transport2.handleRequest("getTime", async (payload, context) => {
    console.log(`Received getTime request`);
    console.log(`From: ${context.source}`);
    
    return {
      time: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  });
  
  // Create a message context for transport1
  const context: MessageContext = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    source: "transport1",
    target: "transport2",
    metadata: {
      version: "1.0.0",
    },
  };
  
  // Emit an event from transport1
  await transport1.emit("greeting", {
    message: "Hello from transport1!",
  }, context);
  
  // Send a request from transport1 to transport2
  try {
    const response = await transport1.request("getTime", {}, context);
    console.log("Received response:", response);
  } catch (error) {
    console.error("Error sending request:", error);
  }
  
  // Disconnect both transports
  await transport1.disconnect();
  await transport2.disconnect();
  
  console.log("Transports disconnected");
}

main().catch(console.error);
```

## Best Practices

1. **Error Handling**: Implement proper error handling in your custom transports
2. **Timeouts**: Include timeouts for requests to avoid blocking indefinitely
3. **Reconnection**: Consider implementing automatic reconnection logic
4. **Serialization**: Be careful with serialization/deserialization of messages
5. **Authentication**: Implement secure authentication mechanisms
6. **Connection Management**: Properly manage connections to avoid leaks
7. **Logging**: Include appropriate logging for debugging purposes