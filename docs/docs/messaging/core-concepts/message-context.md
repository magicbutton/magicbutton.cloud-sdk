---
sidebar_position: 4
---

# Message Context

Message context is a critical component in Magic Button Messaging that allows you to pass metadata along with your messages. This enables features like authentication, tracing, and custom metadata propagation throughout your distributed system.

## What is Message Context?

Message context is a structured object that accompanies every message (both events and requests) and contains metadata about the message. It provides information such as:

- Source and target identifiers
- Authentication information
- Tracing IDs for observability
- Custom metadata for application-specific needs

The context travels with messages through the entire communication chain, making it essential for cross-cutting concerns like security and observability.

## Context Structure

The `MessageContext` interface defines the structure of message context:

```typescript
interface MessageContext {
  // Core properties
  id: string;             // Unique identifier for this context
  timestamp: number;      // Creation timestamp (milliseconds since epoch)
  
  // Origin and destination
  source?: string;        // The source of the message (e.g., service name, client ID)
  target?: string;        // The intended target of the message
  
  // Authentication and authorization
  auth?: {
    token?: string;       // Authentication token (e.g., JWT)
    actor?: Actor;        // Actor information (id, type, roles, permissions)
  };
  
  // Distributed tracing
  traceId?: string;       // Trace ID for correlating messages in a transaction
  spanId?: string;        // Span ID for this specific operation
  parentSpanId?: string;  // Parent span ID (for nested operations)
  
  // Custom metadata
  metadata?: Record<string, unknown>; // Arbitrary metadata
}
```

## Creating Message Context

You can create message context using the `createMessageContext` function:

```typescript
import { createMessageContext } from "@magicbutton.cloud/messaging";

// Create a basic context
const context = createMessageContext({
  source: "web-client-1",
  target: "order-service",
});

// Create a context with authentication
const authContext = createMessageContext({
  source: "web-client-1",
  target: "order-service",
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    actor: {
      id: "user-123",
      type: "user",
      roles: ["customer"],
    },
  },
});

// Create a context with tracing
const tracedContext = createMessageContext({
  source: "web-client-1",
  target: "order-service",
  traceId: "trace-123",
  spanId: "span-456",
});

// Create a context with custom metadata
const metadataContext = createMessageContext({
  source: "web-client-1",
  target: "order-service",
  metadata: {
    requestId: "req-123",
    sessionId: "session-456",
    feature: "shopping-cart",
  },
});
```

The `createMessageContext` function automatically generates:
- A unique context ID (if not provided)
- A timestamp (if not provided)
- A trace ID (if not provided and tracing is enabled)
- A span ID (if not provided and tracing is enabled)

## Using Message Context

### With Client Requests

Context can be passed with client requests:

```typescript
// Create a context
const context = createMessageContext({
  auth: {
    token: localStorage.getItem("auth-token"),
  },
  metadata: {
    sessionId: sessionStorage.getItem("session-id"),
  },
});

// Send a request with context
const orderDetails = await client.request("getOrderDetails", {
  orderId: "order-123",
}, context);
```

### With Client Events

Context can also be passed with events:

```typescript
// Create a context for an event
const context = createMessageContext({
  metadata: {
    clientVersion: "2.0.0",
    userAgent: navigator.userAgent,
  },
});

// Emit an event with context
await client.emit("viewItem", {
  itemId: "item-456",
  timestamp: Date.now(),
}, context);
```

### In Server Handlers

On the server side, you receive the context with requests and events:

```typescript
// Request handler with context
server.handleRequest("getOrderDetails", async (payload, context, clientId) => {
  // Log the request
  logger.info(`Request for order ${payload.orderId}`, {
    clientId,
    traceId: context.traceId,
    userId: context.auth?.actor?.id,
  });
  
  // Use context for authorization
  if (context.auth?.actor) {
    const actor = context.auth.actor;
    const orderId = payload.orderId;
    
    // Check if the user has permission to view this order
    const hasPermission = await authService.checkPermission(
      actor,
      "order:read",
      { resourceId: orderId }
    );
    
    if (!hasPermission) {
      throw new Error("PERMISSION_DENIED");
    }
  } else {
    throw new Error("AUTHENTICATION_REQUIRED");
  }
  
  // Process the request
  const order = await orderRepository.findById(payload.orderId);
  
  return order;
});
```

## Context Propagation

Message context should be propagated through the entire call chain to maintain tracing and authentication information:

```typescript
// In a service that makes downstream requests
server.handleRequest("processCheckout", async (payload, context, clientId) => {
  // Create a child context that preserves tracing and auth
  const childContext = createMessageContext({
    ...context,
    source: "order-service", // Update the source
    target: "payment-service", // Set the target
    parentSpanId: context.spanId, // Set the parent span
    spanId: undefined, // Will generate a new span ID
  });
  
  // Make a downstream request with the child context
  const paymentResult = await paymentClient.request("processPayment", {
    amount: payload.amount,
    paymentMethod: payload.paymentMethod,
  }, childContext);
  
  // Return the result
  return {
    orderId: payload.orderId,
    paymentId: paymentResult.paymentId,
    status: "completed",
  };
});
```

## Common Context Use Cases

### Authentication and Authorization

Context provides a standard way to pass authentication tokens and actor information:

```typescript
// Client-side authentication
const authResult = await client.login({
  username: "user@example.com",
  password: "password123",
});

// Create a context with the auth token
const authContext = createMessageContext({
  auth: {
    token: authResult.token,
  },
});

// Use the auth context for all requests
const orderDetails = await client.request("getOrderDetails", {
  orderId: "order-123",
}, authContext);
```

On the server side, you can use middleware to handle authentication:

```typescript
import { createAuthenticationMiddleware } from "@magicbutton.cloud/messaging";

// Create authentication middleware
const authMiddleware = createAuthenticationMiddleware(
  async (context) => {
    if (!context.auth?.token) {
      return false;
    }
    
    // Verify the token
    try {
      const tokenInfo = await authService.verifyToken(context.auth.token);
      
      // Add actor information to the context
      if (!context.auth.actor) {
        context.auth.actor = {
          id: tokenInfo.userId,
          type: "user",
          roles: tokenInfo.roles,
        };
      }
      
      return true;
    } catch (error) {
      return false;
    }
  },
  { exclude: ["login", "register", "publicEndpoint"] }
);

// Use the middleware
server.useGlobalRequestMiddleware(authMiddleware);
```

### Distributed Tracing

Context enables distributed tracing across service boundaries:

```typescript
import { createTracedContext } from "@magicbutton.cloud/messaging";

// Create a traced context for a new operation
const context = createTracedContext({}, "checkout-process");

// The context now has trace ID and span ID

// Make a request with the traced context
const result = await client.request("processCheckout", {
  items: cart.items,
  shippingAddress: user.address,
  paymentMethod: selectedPayment,
}, context);

// The trace continues through all downstream services
```

On the server side, you can log the trace information:

```typescript
import { logRequest, logResponse } from "@magicbutton.cloud/messaging";

server.handleRequest("processCheckout", async (payload, context, clientId) => {
  // Log the request with trace info
  logRequest({
    type: "processCheckout",
    payload,
    context,
  });
  
  // Process the request
  // ...
  
  // Create the response
  const response = {
    orderId: generatedOrderId,
    status: "processing",
  };
  
  // Log the response with trace info
  logResponse("processCheckout", {
    success: true,
    data: response,
    context,
  }, startTime);
  
  return response;
});
```

### Custom Metadata

Context allows you to pass application-specific metadata:

```typescript
// Create a context with custom metadata
const context = createMessageContext({
  metadata: {
    sessionId: "session-123",
    experimentId: "exp-456",
    featureFlags: {
      newCheckout: true,
      betaFeatures: false,
    },
  },
});

// Use the context with a request
const result = await client.request("getRecommendations", {
  userId: "user-123",
  limit: 10,
}, context);
```

On the server side:

```typescript
server.handleRequest("getRecommendations", async (payload, context, clientId) => {
  // Extract metadata
  const experimentId = context.metadata?.experimentId as string;
  const featureFlags = context.metadata?.featureFlags as Record<string, boolean>;
  
  // Use metadata to customize behavior
  let recommendations;
  
  if (experimentId === "exp-456") {
    // Use experimental recommendation algorithm
    recommendations = await experimentalRecommendationService.getRecommendations(
      payload.userId,
      payload.limit
    );
  } else {
    // Use standard recommendation algorithm
    recommendations = await recommendationService.getRecommendations(
      payload.userId,
      payload.limit
    );
  }
  
  // Apply feature flags
  if (featureFlags?.newCheckout) {
    // Add checkout-specific recommendations
    recommendations = addCheckoutRecommendations(recommendations);
  }
  
  return recommendations;
});
```

## Best Practices

1. **Be Consistent**: Use a consistent approach to context creation
2. **Propagate Context**: Always propagate context in service-to-service communication
3. **Keep It Lean**: Include only necessary information in context to avoid bloat
4. **Use Typed Metadata**: Define interfaces for your metadata to ensure type safety
5. **Set Defaults**: Establish default context properties for your organization
6. **Secure Sensitive Information**: Be cautious about including sensitive data in context
7. **Follow Tracing Standards**: Use industry standards for tracing (e.g., OpenTelemetry)

## Next Steps

Now that you understand message context, explore these related topics:

- [Access Control](../features/access-control): Learn about secure communication with context-based auth
- [Middleware](../features/middleware): Use middleware to process context
- [Observability](../features/observability): Implement tracing using context