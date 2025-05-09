---
sidebar_position: 3
---

# Client and Server

Magic Button Messaging uses a client-server architecture for communication, which provides a clean separation of concerns and a familiar paradigm for distributed systems. This page explains how clients and servers work, their key features, and how to use them effectively.

## Overview

The client-server model in Magic Button Messaging consists of:

- **Server**: Handles incoming requests, processes them, and sends responses
- **Client**: Initiates requests to servers and handles their responses

This model is flexible and can be used for various communication patterns:

- Request/Response: Client sends a request, server responds
- Events/Publish-Subscribe: Server publishes events, clients subscribe
- Bidirectional Communication: Both client and server can initiate communication

## The Server Class

The `Server` class provides the following capabilities:

- Handling client registration and connection lifecycle
- Processing requests from clients
- Broadcasting events to clients
- Monitoring client health through heartbeats

### Creating a Server

To create a server, you need a transport adapter:

```typescript
import { Server, InMemoryTransport } from "@magicbutton.cloud/messaging";

// Create a server with the in-memory transport
const transport = new InMemoryTransport();
const server = new Server(transport, {
  serverId: "order-service", // Optional unique ID for the server
  version: "1.0.0",          // Optional version of the server
  heartbeatInterval: 30000,  // Optional heartbeat interval in ms (default: 30s)
  clientTimeout: 90000,      // Optional client timeout in ms (default: 90s)
  maxClients: 1000,          // Optional maximum number of clients (default: 1000)
  capabilities: ["orders"],  // Optional list of capabilities
});
```

### Starting a Server

Once created, you can start the server with a connection string:

```typescript
// Start the server
await server.start("memory://order-service");
console.log("Server started on memory://order-service");
```

The connection string format depends on the transport adapter being used:

- For `InMemoryTransport`: `memory://service-name`
- For WebSocket transport: `ws://hostname:port/path`
- For HTTP transport: `http://hostname:port/path`

### Handling Requests

You can register handlers for different request types:

```typescript
// Handle a request to get order details
server.handleRequest("getOrderDetails", async (payload, context, clientId) => {
  const { orderId } = payload;
  
  // Validate the order ID
  if (!orderId.match(/^order-\d+$/)) {
    throw new Error("INVALID_ORDER_ID");
  }
  
  // Get the order from the database
  const order = await orderRepository.findById(orderId);
  
  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }
  
  return order;
});
```

Request handlers receive three parameters:

1. `payload`: The request payload (typed based on your contract)
2. `context`: The message context containing metadata
3. `clientId`: The ID of the client making the request

They can return a value (which becomes the response) or throw an error (which is sent back to the client as an error response).

### Broadcasting Events

Servers can broadcast events to all connected clients:

```typescript
// Broadcast an order created event
await server.broadcast("orderCreated", {
  orderId: "order-123",
  customerId: "customer-456",
  amount: 99.99,
  timestamp: Date.now(),
});
```

### Sending Events to Specific Clients

You can also send events to specific clients:

```typescript
// Send an event to a specific client
await server.sendToClient("customer-app-1", "orderStatusUpdated", {
  orderId: "order-123",
  status: "shipped",
  updatedAt: Date.now(),
});
```

### Server Lifecycle

A complete server lifecycle might look like this:

```typescript
// Create and start the server
const server = new Server(transport);
await server.start("memory://order-service");

// Register request handlers
server.handleRequest("getOrderDetails", /* ... */);
server.handleRequest("createOrder", /* ... */);
server.handleRequest("cancelOrder", /* ... */);

// When shutting down
process.on("SIGTERM", async () => {
  console.log("Shutting down server...");
  await server.stop();
  process.exit(0);
});
```

## The Client Class

The `Client` class provides the following capabilities:

- Connecting to servers
- Sending requests and handling responses
- Subscribing to events
- Automatic reconnection
- Authentication

### Creating a Client

To create a client, you need a transport adapter:

```typescript
import { Client, InMemoryTransport } from "@magicbutton.cloud/messaging";

// Create a client with the in-memory transport
const transport = new InMemoryTransport();
const client = new Client(transport, {
  clientId: "web-client-1",      // Optional unique ID for the client
  clientType: "web",             // Optional type of client
  autoReconnect: true,           // Optional auto reconnect feature (default: true)
  reconnectInterval: 5000,       // Optional reconnect interval in ms (default: 5s)
  heartbeatInterval: 30000,      // Optional heartbeat interval in ms (default: 30s)
  capabilities: ["admin"],       // Optional list of capabilities
  metadata: { version: "1.0" },  // Optional metadata
});
```

### Connecting to a Server

Once created, you can connect the client to a server:

```typescript
// Connect to the server
await client.connect("memory://order-service");
console.log("Connected to order service");
```

### Sending Requests

You can send requests to the server and receive responses:

```typescript
// Send a request to get order details
try {
  const orderDetails = await client.request("getOrderDetails", { 
    orderId: "order-123" 
  });
  
  console.log("Order details:", orderDetails);
} catch (error) {
  console.error("Error getting order details:", error.message);
}
```

The `request` method is generic and can be strongly typed:

```typescript
// With TypeScript, you can have strong typing
const orderDetails = await client.request<OrderResponse>("getOrderDetails", { 
  orderId: "order-123" 
});

// orderDetails is typed as OrderResponse
```

### Subscribing to Events

Clients can subscribe to events from the server:

```typescript
// Subscribe to order created events
client.on("orderCreated", (payload, context) => {
  console.log("New order created:", payload.orderId);
  
  // Update the UI or take other actions
  updateOrdersList(payload);
});

// Subscribe to order shipped events
client.on("orderShipped", (payload, context) => {
  console.log(`Order ${payload.orderId} has shipped!`);
  
  // Update the order status
  updateOrderStatus(payload.orderId, "shipped");
});
```

### Emitting Events

Clients can also emit events:

```typescript
// Emit a client-side event
await client.emit("clientActivity", {
  clientId: client.getClientId(),
  action: "viewOrder",
  orderId: "order-123",
  timestamp: Date.now(),
});
```

### Client Status Monitoring

You can monitor the client's connection status:

```typescript
// Listen for status changes
const unsubscribe = client.onStatusChange((status) => {
  console.log("Client status changed:", status);
  
  if (status === "connected") {
    // Update UI to show connected state
    updateConnectionStatus("Connected");
  } else if (status === "disconnected" || status === "error") {
    // Update UI to show disconnected state
    updateConnectionStatus("Disconnected");
  }
});

// Later, when you don't need the listener anymore
unsubscribe();
```

### Error Handling

You can also listen for client errors:

```typescript
// Listen for errors
client.onError((error) => {
  console.error("Client error:", error.message);
  
  // Log or display the error
  showErrorNotification(error.message);
});
```

### Authentication

Clients can authenticate with the server:

```typescript
// Login with username/password
const authResult = await client.login({
  username: "admin",
  password: "secret123",
});

if (authResult.success) {
  console.log("Authentication successful:", authResult.user);
  
  // Store the token for later use
  localStorage.setItem("auth-token", authResult.token);
} else {
  console.error("Authentication failed:", authResult.error);
}

// Later, logout
await client.logout();
```

### Client Lifecycle

A complete client lifecycle might look like this:

```typescript
// Create and connect the client
const client = new Client(transport);
await client.connect("memory://order-service");

// Subscribe to events
client.on("orderCreated", /* ... */);
client.on("orderStatusUpdated", /* ... */);

// Send requests as needed
const orderDetails = await client.request("getOrderDetails", { orderId: "order-123" });

// When done, disconnect
await client.disconnect();
```

## Client-Server Interaction Patterns

Magic Button Messaging supports several interaction patterns:

### Request-Response

The most basic pattern is request-response:

```typescript
// Client sends a request
const result = await client.request("calculateTotal", { items: [...] });

// Server handles the request
server.handleRequest("calculateTotal", async (payload) => {
  const total = payload.items.reduce((sum, item) => sum + item.price, 0);
  return { total };
});
```

### Publish-Subscribe

Events follow the publish-subscribe pattern:

```typescript
// Server broadcasts an event
await server.broadcast("itemAdded", { id: "item-123", name: "Product" });

// Client subscribes to events
client.on("itemAdded", (payload) => {
  console.log("New item added:", payload.name);
});
```

### Request-Stream

You can implement a request-stream pattern using multiple events:

```typescript
// Client initiates a stream
const streamId = await client.request("startStream", { query: "SELECT * FROM orders" });

// Client subscribes to stream events
client.on("streamData", (payload) => {
  if (payload.streamId === streamId) {
    console.log("Stream data:", payload.data);
  }
});

client.on("streamEnd", (payload) => {
  if (payload.streamId === streamId) {
    console.log("Stream ended");
  }
});

// Server sends multiple events
server.handleRequest("startStream", async (payload, context, clientId) => {
  const streamId = crypto.randomUUID();
  
  // Start sending data asynchronously
  processStreamAsync(payload.query, async (data) => {
    await server.sendToClient(clientId, "streamData", {
      streamId,
      data,
    });
  }, async () => {
    await server.sendToClient(clientId, "streamEnd", {
      streamId,
    });
  });
  
  return streamId;
});
```

## Best Practices

### For Servers

1. **Use descriptive server IDs**: Choose IDs that clearly identify the service
2. **Handle graceful shutdown**: Stop the server properly to disconnect clients
3. **Validate request payloads**: Always validate incoming data
4. **Set appropriate timeouts**: Configure heartbeat and client timeouts based on your needs
5. **Log client connections/disconnections**: Monitor client activity
6. **Use middleware**: Add validation, logging, and authentication middleware
7. **Handle errors properly**: Return standardized error responses

### For Clients

1. **Use automatic reconnection**: Enable auto-reconnect for resilience
2. **Handle connection failures**: Provide feedback to users when disconnected
3. **Implement request timeouts**: Set appropriate timeouts for requests
4. **Store and reuse authentication tokens**: Avoid unnecessary logins
5. **Clean up event subscriptions**: Unsubscribe from events when no longer needed
6. **Implement retry logic**: Retry failed requests with backoff
7. **Use context for request metadata**: Pass tracing IDs, authentication, etc.

## Next Steps

Now that you understand clients and servers, explore these related topics:

- [Message Context](message-context): Learn how to pass metadata with messages
- [Access Control](../features/access-control): Implement security with role-based access control
- [Middleware](../features/middleware): Extend client and server functionality with middleware