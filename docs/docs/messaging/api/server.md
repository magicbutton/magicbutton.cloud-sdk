---
sidebar_position: 2
---

# Server API Reference

This page provides detailed API reference for the `Server` class in Magic Button Messaging.

## Server Class

The `Server` class is responsible for handling client connections, processing requests, and broadcasting events.

### Type Parameters

- `TEvents` - Type of events this server can handle (extends `Record<string, any>`)
- `TRequests` - Type of requests this server can process (extends `Record<string, any>`)

Both of these type parameters are automatically extended with system events and requests.

### Constructor

```typescript
constructor(
  adapter: TransportAdapter<typeof systemEvents & TEvents, typeof systemRequests & TRequests>,
  options: ServerOptions = {},
)
```

Creates a new messaging server instance.

#### Parameters

- `adapter` - The transport adapter to use for communication
- `options` - (Optional) Configuration options for the server

#### Example

```typescript
import { Server, InMemoryTransport } from "@magicbutton.cloud/messaging";

// Create a server with in-memory transport
const transport = new InMemoryTransport();
const server = new Server(transport, {
  serverId: "main-message-server",
  version: "2.0.0",
  maxClients: 500
});
```

### ServerOptions Interface

```typescript
interface ServerOptions {
  serverId?: string
  version?: string
  heartbeatInterval?: number
  clientTimeout?: number
  maxClients?: number
  capabilities?: string[]
}
```

- `serverId` - Unique identifier for the server. If not provided, a UUID will be generated
- `version` - Version of the server. Default: "1.0.0"
- `heartbeatInterval` - Interval in milliseconds for sending heartbeat messages. Default: 30000
- `clientTimeout` - Timeout in milliseconds after which clients are considered disconnected. Default: 90000 (3x heartbeat interval)
- `maxClients` - Maximum number of clients that can connect to this server. Default: 1000
- `capabilities` - List of capabilities supported by this server

## Server Lifecycle Methods

### start

```typescript
async start(connectionString: string): Promise<void>
```

Starts the server with the specified connection string. Connects the transport adapter and begins listening for client connections.

#### Parameters

- `connectionString` - The connection string where the server will listen

#### Returns

- A promise that resolves when the server has started

#### Throws

- Error if the server fails to start or the transport adapter cannot connect

#### Example

```typescript
// Start server on an in-memory transport
await server.start("memory://message-hub");

// Start server on a WebSocket transport
await server.start("ws://0.0.0.0:8080/messaging");
```

### stop

```typescript
async stop(): Promise<void>
```

Stops the server, disconnects all clients, and releases resources.

#### Returns

- A promise that resolves when the server has stopped

#### Example

```typescript
await server.stop();
```

## Request Handling Methods

### handleRequest

```typescript
handleRequest<R extends string & keyof TRequests>(
  requestType: R,
  handler: (payload: any, context: MessageContext, clientId: string) => Promise<any>,
): void
```

Registers a handler for a specific request type.

#### Type Parameters

- `R` - The request type, must be a key of `TRequests`

#### Parameters

- `requestType` - The type of request to handle
- `handler` - The function to call when a request of this type is received
  - `payload` - The request payload
  - `context` - The message context
  - `clientId` - The ID of the client making the request

#### Example

```typescript
// Handle a request to get user data
server.handleRequest("getUserById", async (payload, context, clientId) => {
  const { id } = payload;
  
  // Authenticate the request
  if (!context.auth?.token) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }
  
  // Verify the token (example implementation)
  const actor = await verifyToken(context.auth.token);
  
  // Check permissions
  if (!hasPermission(actor, "user:read")) {
    throw new Error("PERMISSION_DENIED");
  }
  
  // Get the user
  const user = await userRepository.findById(id);
  
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  
  return user;
});
```

## Event Methods

### broadcast

```typescript
async broadcast(message: string, data?: any): Promise<void>
```

Broadcasts a message to all connected clients.

#### Parameters

- `message` - The message to broadcast
- `data` - (Optional) Additional data to include with the message

#### Returns

- A promise that resolves when the message has been broadcast

#### Example

```typescript
// Broadcast a system message
await server.broadcast("System maintenance", {
  scheduledStart: new Date("2023-06-01T02:00:00Z"),
  expectedDuration: "2 hours",
  affectedServices: ["user-service", "order-service"],
});
```

### sendToClient

```typescript
async sendToClient<E extends string & keyof TEvents>(
  clientId: string,
  event: E,
  payload: any
): Promise<void>
```

Sends an event to a specific client.

#### Type Parameters

- `E` - The event type, must be a key of `TEvents`

#### Parameters

- `clientId` - The ID of the client to send to
- `event` - The type of event to send
- `payload` - The event payload

#### Returns

- A promise that resolves when the event has been sent

#### Throws

- Error if the client is not found

#### Example

```typescript
// Send a notification to a specific client
await server.sendToClient("user-client-123", "notificationReceived", {
  id: "notification-456",
  type: "message",
  title: "New message",
  body: "You have received a new message from John",
  timestamp: Date.now(),
});
```

## Client Management Methods

### getClients

```typescript
getClients(): ClientConnection[]
```

Gets all connected clients.

#### Returns

- An array of client connections

#### Example

```typescript
// Get all connected clients
const clients = server.getClients();
console.log(`Connected clients: ${clients.length}`);

// Log client details
clients.forEach(client => {
  console.log(`Client ID: ${client.clientId}`);
  console.log(`Connection ID: ${client.connectionId}`);
  console.log(`Client type: ${client.clientType}`);
  console.log(`Last activity: ${new Date(client.lastActivity).toISOString()}`);
  console.log("---");
});
```

### getClient

```typescript
getClient(clientId: string): ClientConnection | undefined
```

Gets a specific client by ID.

#### Parameters

- `clientId` - The ID of the client to get

#### Returns

- The client connection, or undefined if not found

#### Example

```typescript
// Get a specific client
const client = server.getClient("user-client-123");

if (client) {
  console.log(`Client found: ${client.clientId}`);
  console.log(`Last activity: ${new Date(client.lastActivity).toISOString()}`);
} else {
  console.log("Client not found");
}
```

### getClientCount

```typescript
getClientCount(): number
```

Gets the number of connected clients.

#### Returns

- The number of connected clients

#### Example

```typescript
// Get client count
const clientCount = server.getClientCount();
console.log(`Connected clients: ${clientCount}`);
```

## Server Information Methods

### getServerInfo

```typescript
getServerInfo(): {
  serverId: string
  version: string
  uptime: number
  connectedClients: number
  capabilities: string[]
}
```

Gets information about the server.

#### Returns

- Server information object
  - `serverId` - The server ID
  - `version` - The server version
  - `uptime` - The server uptime in milliseconds
  - `connectedClients` - The number of connected clients
  - `capabilities` - List of capabilities supported by this server

#### Example

```typescript
// Get server info
const info = server.getServerInfo();
console.log(`Server ID: ${info.serverId}`);
console.log(`Version: ${info.version}`);
console.log(`Uptime: ${Math.floor(info.uptime / 1000 / 60)} minutes`);
console.log(`Connected clients: ${info.connectedClients}`);
console.log(`Capabilities: ${info.capabilities.join(", ")}`);
```

## ClientConnection Interface

The `ClientConnection` interface represents a connected client:

```typescript
interface ClientConnection {
  clientId: string
  connectionId: string
  clientType: string
  capabilities: string[]
  metadata: Record<string, unknown>
  lastActivity: number
  subscriptions: Map<string, { events: string[]; filter?: Record<string, unknown> }>
}
```

- `clientId` - The client's unique identifier
- `connectionId` - The unique identifier for this connection
- `clientType` - The type of client
- `capabilities` - List of capabilities supported by the client
- `metadata` - Additional metadata for the client
- `lastActivity` - Timestamp of the client's last activity
- `subscriptions` - Map of the client's event subscriptions

## System Events

The server emits several system events:

- `$connected` - Emitted when a client connects
- `$disconnected` - Emitted when a client disconnects
- `$heartbeat` - Heartbeat messages to check client health

## Complete Example

Here's a complete example showing how to use the Server API:

```typescript
import { 
  Server, 
  InMemoryTransport 
} from "@magicbutton.cloud/messaging";

async function main() {
  // Create a server
  const transport = new InMemoryTransport();
  const server = new Server(transport, {
    serverId: "users-service",
    version: "1.0.0",
    maxClients: 100,
    capabilities: ["users"],
  });
  
  // Set up request handlers
  
  // Handle user authentication
  server.handleRequest("authenticate", async (payload, context, clientId) => {
    const { username, password } = payload;
    
    // Simulate user authentication
    if (username === "admin" && password === "password") {
      return {
        success: true,
        token: "fake-jwt-token",
        user: {
          id: "user-1",
          username: "admin",
          roles: ["admin"],
        },
      };
    } else {
      throw new Error("INVALID_CREDENTIALS");
    }
  });
  
  // Handle get user request
  server.handleRequest("getUserById", async (payload, context, clientId) => {
    const { id } = payload;
    
    // Check authentication
    if (!context.auth?.token) {
      throw new Error("AUTHENTICATION_REQUIRED");
    }
    
    // Simulate database lookup
    if (id === "user-1") {
      return {
        id: "user-1",
        username: "admin",
        email: "admin@example.com",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
      };
    } else if (id === "user-2") {
      return {
        id: "user-2",
        username: "user",
        email: "user@example.com",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15, // 15 days ago
      };
    } else {
      throw new Error("USER_NOT_FOUND");
    }
  });
  
  // Handle create user request
  server.handleRequest("createUser", async (payload, context, clientId) => {
    const { username, email, password } = payload;
    
    // Check authentication
    if (!context.auth?.token) {
      throw new Error("AUTHENTICATION_REQUIRED");
    }
    
    // Check if user exists (simulate database check)
    if (username === "admin" || username === "user") {
      throw new Error("USERNAME_TAKEN");
    }
    
    // Create user
    const user = {
      id: `user-${Date.now()}`,
      username,
      email,
      createdAt: Date.now(),
    };
    
    // Broadcast user created event
    await server.broadcast("userCreated", {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    });
    
    return user;
  });
  
  // Start the server
  await server.start("memory://users-service");
  
  console.log("Server started");
  console.log("Server info:", server.getServerInfo());
  
  // Set up periodic monitoring
  const monitoringInterval = setInterval(() => {
    const clients = server.getClients();
    console.log(`Connected clients: ${clients.length}`);
    
    clients.forEach(client => {
      console.log(`- ${client.clientId} (${client.clientType}): last activity ${Math.floor((Date.now() - client.lastActivity) / 1000)}s ago`);
    });
  }, 10000);
  
  // Handle process termination
  process.on("SIGINT", async () => {
    console.log("Shutting down server...");
    
    clearInterval(monitoringInterval);
    await server.stop();
    
    console.log("Server stopped");
    process.exit(0);
  });
}

main().catch(console.error);
```

## Best Practices

1. **Handle Request Validation**: Validate incoming request payloads before processing
2. **Authentication & Authorization**: Check authentication and permissions in request handlers
3. **Error Handling**: Use appropriate error codes and messages
4. **Resource Cleanup**: Always call `stop` when shutting down the server
5. **Security**: Be cautious about broadcasting sensitive information
6. **Performance**: Be mindful of the performance impact of broadcast operations with many clients
7. **Monitoring**: Regularly check client connections and handle timeouts