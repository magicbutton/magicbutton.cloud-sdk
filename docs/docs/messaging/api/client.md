---
sidebar_position: 1
---

# Client API Reference

This page provides detailed API reference for the `Client` class in Magic Button Messaging.

## Client Class

The `Client` class is responsible for connecting to servers, sending requests, and subscribing to events.

### Type Parameters

- `TEvents` - Type of events this client can handle (extends `Record<string, any>`)
- `TRequests` - Type of requests this client can send (extends `Record<string, any>`)

Both of these type parameters are automatically extended with system events and requests.

### Constructor

```typescript
constructor(
  adapter: TransportAdapter<typeof systemEvents & TEvents, typeof systemRequests & TRequests>,
  options: ClientOptions = {},
)
```

Creates a new messaging client instance.

#### Parameters

- `adapter` - The transport adapter to use for communication
- `options` - (Optional) Configuration options for the client

#### Example

```typescript
import { Client, InMemoryTransport } from "@magicbutton.cloud/messaging";

// Create a client with in-memory transport
const transport = new InMemoryTransport();
const client = new Client(transport, {
  clientId: "frontend-client-1",
  clientType: "frontend",
  autoReconnect: true
});
```

### ClientOptions Interface

```typescript
interface ClientOptions {
  clientId?: string
  clientType?: string
  autoReconnect?: boolean
  reconnectInterval?: number
  heartbeatInterval?: number
  capabilities?: string[]
  metadata?: Record<string, unknown>
}
```

- `clientId` - Unique identifier for the client. If not provided, a UUID will be generated
- `clientType` - Type of client, used for identification and filtering. Default: "generic"
- `autoReconnect` - Whether to automatically reconnect when the connection is lost. Default: true
- `reconnectInterval` - Interval in milliseconds between reconnection attempts. Default: 5000
- `heartbeatInterval` - Interval in milliseconds for sending heartbeat messages. Default: 30000
- `capabilities` - List of capabilities supported by this client
- `metadata` - Additional metadata for the client

### ClientStatus Enum

```typescript
enum ClientStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  RECONNECTING = "reconnecting",
  ERROR = "error",
}
```

Represents the possible states of a messaging client.

## Connection Methods

### connect

```typescript
async connect(connectionString: string): Promise<void>
```

Connects the client to a messaging server using the provided connection string.

#### Parameters

- `connectionString` - The connection string for the server

#### Returns

- A promise that resolves when connected successfully

#### Throws

- Error if connection fails or registration with the server fails

#### Example

```typescript
// Connect to an in-memory server
await client.connect("memory://message-server");

// Connect to a WebSocket server
await client.connect("ws://localhost:8080/messaging");
```

### disconnect

```typescript
async disconnect(): Promise<void>
```

Disconnects the client from the server.

#### Returns

- A promise that resolves when disconnected successfully

#### Example

```typescript
await client.disconnect();
```

### isConnected

```typescript
isConnected(): boolean
```

Checks if the client is currently connected to a server.

#### Returns

- `true` if connected, `false` otherwise

#### Example

```typescript
if (client.isConnected()) {
  console.log("Client is connected");
} else {
  console.log("Client is disconnected");
}
```

### getStatus

```typescript
getStatus(): ClientStatus
```

Gets the current status of the client.

#### Returns

- The current client status

#### Example

```typescript
const status = client.getStatus();
console.log(`Client status: ${status}`);
```

## Request and Event Methods

### request

```typescript
async request<R extends string & keyof TRequests>(
  requestType: R,
  payload: any,
  context?: MessageContext,
): Promise<any>
```

Sends a request to the server and awaits a response.

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
  const user = await client.request("getUserById", { id: "user-123" });
  console.log("User:", user);
} catch (error) {
  console.error("Error getting user:", error);
}
```

### emit

```typescript
async emit<E extends string & keyof TEvents>(
  event: E,
  payload: any,
  context?: MessageContext
): Promise<void>
```

Emits an event to the server.

#### Type Parameters

- `E` - The event type, must be a key of `TEvents`

#### Parameters

- `event` - The type of event to emit
- `payload` - The event payload
- `context` - (Optional) Additional context for the event

#### Returns

- A promise that resolves when the event has been sent

#### Example

```typescript
await client.emit("userActivity", {
  userId: "user-123",
  action: "viewPage",
  page: "/dashboard",
  timestamp: Date.now(),
});
```

### on

```typescript
on<E extends string & keyof (TEvents & typeof systemEvents)>(
  event: E,
  handler: (payload: any, context: MessageContext) => void,
  context?: MessageContext,
): void
```

Registers an event handler for a specific event type.

#### Type Parameters

- `E` - The event type, must be a key of `TEvents` or system events

#### Parameters

- `event` - The type of event to listen for
- `handler` - The function to call when the event is received
- `context` - (Optional) Additional context for the subscription

#### Example

```typescript
// Subscribe to userCreated events
client.on("userCreated", (payload, context) => {
  console.log("New user created:", payload);
  updateUserList(payload);
});

// Subscribe to system events
client.on("$connected", (payload, context) => {
  console.log("Client connected:", payload.clientId);
});
```

### off

```typescript
off<E extends string & keyof (TEvents & typeof systemEvents)>(
  event: E,
  handler: (payload: any, context: MessageContext) => void
): void
```

Unregisters an event handler for a specific event type.

#### Type Parameters

- `E` - The event type, must be a key of `TEvents` or system events

#### Parameters

- `event` - The type of event to stop listening for
- `handler` - The function to unregister

#### Example

```typescript
// Define a handler function
const handleUserCreated = (payload, context) => {
  console.log("New user created:", payload);
};

// Subscribe to events
client.on("userCreated", handleUserCreated);

// Later, unsubscribe
client.off("userCreated", handleUserCreated);
```

## Subscription Methods

### subscribe

```typescript
async subscribe(
  events: string[],
  filter?: Record<string, unknown>
): Promise<string>
```

Subscribes to multiple events with optional filtering.

#### Parameters

- `events` - Array of event types to subscribe to
- `filter` - (Optional) Filter criteria for events

#### Returns

- A promise that resolves with the subscription ID

#### Example

```typescript
// Subscribe to multiple events
const subscriptionId = await client.subscribe([
  "orderCreated",
  "orderUpdated",
  "orderShipped",
], {
  customerId: "customer-123" // Only receive events for this customer
});

console.log(`Subscription ID: ${subscriptionId}`);
```

### unsubscribe

```typescript
async unsubscribe(subscriptionId: string): Promise<void>
```

Unsubscribes from events using a subscription ID.

#### Parameters

- `subscriptionId` - The ID of the subscription to cancel

#### Returns

- A promise that resolves when unsubscribed successfully

#### Example

```typescript
// Unsubscribe using subscription ID
await client.unsubscribe(subscriptionId);
```

## Authentication Methods

### login

```typescript
async login(
  credentials: { username: string; password: string } | { token: string }
): Promise<AuthResult>
```

Authenticates with the server.

#### Parameters

- `credentials` - Either username/password or token credentials

#### Returns

- A promise that resolves with the authentication result

#### Example

```typescript
// Login with username and password
const authResult = await client.login({
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

// Login with token
const tokenAuthResult = await client.login({
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
});
```

### logout

```typescript
async logout(): Promise<void>
```

Logs out from the server.

#### Returns

- A promise that resolves when logged out successfully

#### Example

```typescript
await client.logout();
```

## Monitoring Methods

### onStatusChange

```typescript
onStatusChange(listener: (status: ClientStatus) => void): () => void
```

Registers a listener for client status changes.

#### Parameters

- `listener` - Function to call when the status changes

#### Returns

- A function that unsubscribes the listener when called

#### Example

```typescript
// Listen for status changes
const unsubscribe = client.onStatusChange((status) => {
  console.log(`Client status changed: ${status}`);
  
  if (status === "connected") {
    showConnectedUI();
  } else if (status === "disconnected" || status === "error") {
    showDisconnectedUI();
  }
});

// Later, unsubscribe
unsubscribe();
```

### onError

```typescript
onError(listener: (error: Error) => void): () => void
```

Registers a listener for client errors.

#### Parameters

- `listener` - Function to call when an error occurs

#### Returns

- A function that unsubscribes the listener when called

#### Example

```typescript
// Listen for errors
const unsubscribe = client.onError((error) => {
  console.error("Client error:", error);
  showErrorNotification(error.message);
});

// Later, unsubscribe
unsubscribe();
```

## Utility Methods

### ping

```typescript
async ping(payload?: string): Promise<{ roundTripTime: number }>
```

Pings the server to measure round-trip time.

#### Parameters

- `payload` - (Optional) Custom payload to include in the ping

#### Returns

- A promise that resolves with the round-trip time in milliseconds

#### Example

```typescript
const pingResult = await client.ping();
console.log(`Round-trip time: ${pingResult.roundTripTime}ms`);
```

### getServerInfo

```typescript
async getServerInfo(): Promise<any>
```

Retrieves information about the connected server.

#### Returns

- A promise that resolves with server information

#### Example

```typescript
const serverInfo = await client.getServerInfo();
console.log("Server ID:", serverInfo.serverId);
console.log("Server version:", serverInfo.version);
console.log("Server uptime:", serverInfo.uptime);
console.log("Connected clients:", serverInfo.connectedClients);
```

### getClientId

```typescript
getClientId(): string
```

Gets the client's ID.

#### Returns

- The client ID

#### Example

```typescript
const clientId = client.getClientId();
console.log(`Client ID: ${clientId}`);
```

### getConnectionId

```typescript
getConnectionId(): string | null
```

Gets the current connection ID, if connected.

#### Returns

- The connection ID, or null if not connected

#### Example

```typescript
const connectionId = client.getConnectionId();
if (connectionId) {
  console.log(`Connection ID: ${connectionId}`);
} else {
  console.log("Not connected");
}
```

### getServerId

```typescript
getServerId(): string | null
```

Gets the ID of the connected server, if connected.

#### Returns

- The server ID, or null if not connected

#### Example

```typescript
const serverId = client.getServerId();
if (serverId) {
  console.log(`Connected to server: ${serverId}`);
} else {
  console.log("Not connected to a server");
}
```

## Complete Example

Here's a complete example showing how to use the Client API:

```typescript
import { 
  Client, 
  InMemoryTransport, 
  createMessageContext, 
  ClientStatus 
} from "@magicbutton.cloud/messaging";

async function main() {
  // Create a client
  const transport = new InMemoryTransport();
  const client = new Client(transport, {
    clientId: "app-client-1",
    clientType: "app",
    autoReconnect: true,
    metadata: {
      version: "1.0.0",
      platform: "web",
    },
  });
  
  // Set up status change listener
  client.onStatusChange((status) => {
    console.log(`Client status: ${status}`);
  });
  
  // Set up error listener
  client.onError((error) => {
    console.error("Client error:", error);
  });
  
  try {
    // Connect to the server
    await client.connect("memory://example-service");
    console.log("Connected to server");
    
    // Get server info
    const serverInfo = await client.getServerInfo();
    console.log("Server info:", serverInfo);
    
    // Authenticate
    const authResult = await client.login({
      username: "user@example.com",
      password: "password123",
    });
    
    if (!authResult.success) {
      throw new Error(`Authentication failed: ${authResult.error.message}`);
    }
    
    console.log("Authenticated successfully");
    
    // Set up event subscription
    client.on("orderStatusChanged", (payload, context) => {
      console.log(`Order ${payload.orderId} status changed to ${payload.status}`);
    });
    
    // Create auth context
    const context = createMessageContext({
      auth: {
        token: authResult.token,
      },
    });
    
    // Send request
    const order = await client.request("createOrder", {
      items: [
        { productId: "product-1", quantity: 2 },
        { productId: "product-2", quantity: 1 },
      ],
      shippingAddress: {
        name: "John Doe",
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        zip: "12345",
      },
    }, context);
    
    console.log("Order created:", order);
    
    // Emit event
    await client.emit("userActivity", {
      action: "createOrder",
      orderId: order.id,
      timestamp: Date.now(),
    }, context);
    
    // Ping the server
    const pingResult = await client.ping();
    console.log(`Server ping: ${pingResult.roundTripTime}ms`);
    
    // Wait for a while to receive events
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Logout and disconnect
    await client.logout();
    await client.disconnect();
    
    console.log("Disconnected from server");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
```