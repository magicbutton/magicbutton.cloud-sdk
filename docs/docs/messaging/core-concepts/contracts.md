---
sidebar_position: 1
---

# Contracts

Contracts are at the heart of Magic Button Messaging's design philosophy. They define the shape of communication between distributed systems components, ensuring type safety, validation, and clear documentation.

## What are Contracts?

In Magic Button Messaging, a contract is a formal definition of:

1. **Events** - One-way messages published by services
2. **Requests/Responses** - Two-way communication between services
3. **Errors** - Standardized error codes and messages

Contracts serve as the single source of truth for both clients and servers, ensuring that all parties understand how to communicate with each other properly.

## Creating Contracts

Contracts are created using the `createContract` function, along with helper functions for events, requests, and errors:

```typescript
import * as z from "zod";
import { 
  createContract, 
  createEventMap, 
  createRequestSchemaMap, 
  createErrorMap 
} from "@magicbutton.cloud/messaging";

// Define event schemas
const events = createEventMap({
  orderCreated: z.object({
    orderId: z.string(),
    customerId: z.string(),
    amount: z.number(),
    timestamp: z.number(),
  }),
  orderShipped: z.object({
    orderId: z.string(),
    trackingNumber: z.string(),
    shippedAt: z.number(),
  }),
});

// Define request/response schemas
const requests = createRequestSchemaMap({
  getOrderDetails: {
    // Schema for the request payload
    requestSchema: z.object({
      orderId: z.string(),
    }),
    // Schema for the response payload
    responseSchema: z.object({
      orderId: z.string(),
      customerId: z.string(),
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number(),
        price: z.number(),
      })),
      total: z.number(),
      status: z.enum(["pending", "processing", "shipped", "delivered"]),
      createdAt: z.number(),
    }),
  },
  cancelOrder: {
    requestSchema: z.object({
      orderId: z.string(),
      reason: z.string().optional(),
    }),
    responseSchema: z.object({
      success: z.boolean(),
      orderId: z.string(),
      cancelledAt: z.number(),
    }),
  },
});

// Define errors
const errors = createErrorMap({
  ORDER_NOT_FOUND: { 
    code: "ORDER_NOT_FOUND", 
    message: "Order not found", 
    status: 404 
  },
  INVALID_ORDER_ID: { 
    code: "INVALID_ORDER_ID", 
    message: "Invalid order ID format", 
    status: 400 
  },
  ORDER_ALREADY_SHIPPED: { 
    code: "ORDER_ALREADY_SHIPPED", 
    message: "Cannot cancel an order that has already shipped", 
    status: 400 
  },
});

// Create the contract
const orderServiceContract = createContract({
  events,
  requests,
  errors,
});

// Export type for type safety
export type OrderServiceContract = typeof orderServiceContract;
export { orderServiceContract };
```

## Contract Components

### Events

Events represent one-way messages that are broadcast to interested parties. They are defined using Zod schemas for validation and type safety:

```typescript
const events = createEventMap({
  userLoggedIn: z.object({
    userId: z.string(),
    timestamp: z.number(),
    deviceInfo: z.object({
      ip: z.string(),
      userAgent: z.string(),
    }),
  }),
});
```

Events are typically used for:
- Notifications of state changes
- Audit logging
- Triggering downstream processes
- Updating caches or read models

### Requests and Responses

Requests and responses represent two-way communication between services. They consist of both a request schema and a response schema:

```typescript
const requests = createRequestSchemaMap({
  authenticateUser: {
    requestSchema: z.object({
      username: z.string(),
      password: z.string(),
    }),
    responseSchema: z.object({
      userId: z.string(),
      token: z.string(),
      expiresAt: z.number(),
    }),
  }),
});
```

Requests are typically used for:
- Querying data
- Executing commands
- Authentication and authorization
- Health checks and status queries

### Errors

Errors provide standardized error codes and messages that can be thrown by services:

```typescript
const errors = createErrorMap({
  UNAUTHORIZED: { 
    code: "UNAUTHORIZED", 
    message: "Authentication required to access this resource", 
    status: 401 
  },
  RATE_LIMITED: { 
    code: "RATE_LIMITED", 
    message: "Rate limit exceeded, please try again later", 
    status: 429 
  },
});
```

## Type Safety with Contracts

One of the key benefits of contracts is type safety. When you use a contract with clients and servers, TypeScript can infer the correct types for events and requests:

```typescript
import { Client, InMemoryTransport } from "@magicbutton.cloud/messaging";
import { orderServiceContract } from "./contract";

// Create a typed client
const client = new Client<
  typeof orderServiceContract["events"],
  typeof orderServiceContract["requests"]
>(new InMemoryTransport());

// TypeScript knows the shape of the request payload and response
const orderDetails = await client.request("getOrderDetails", { 
  orderId: "order-123" 
});
// orderDetails is typed according to the responseSchema

// TypeScript knows the shape of the event payload
client.on("orderCreated", (payload) => {
  // payload is typed according to the event schema
  console.log(`New order created: ${payload.orderId}`);
});
```

## Contract Versioning

As your system evolves, contracts may need to change. Magic Button Messaging supports contract versioning through the `versioned-schema` module:

```typescript
import { createVersionedContract } from "@magicbutton.cloud/messaging";

// Create a versioned contract
const userServiceContract = createVersionedContract({
  name: "user-service",
  versions: {
    "1.0": {
      events: { /* v1.0 events */ },
      requests: { /* v1.0 requests */ },
    },
    "2.0": {
      events: { /* v2.0 events */ },
      requests: { /* v2.0 requests */ },
    },
  },
  defaultVersion: "2.0",
});
```

Versioned contracts allow you to:
- Support multiple versions simultaneously
- Migrate clients gradually
- Maintain backward compatibility

## Sharing Contracts

Contracts should be shared between services, typically as a separate package. This ensures that all services have the same understanding of how to communicate:

```typescript
// contracts/user-service.ts
export const userServiceContract = /* ... */;

// contracts/order-service.ts
export const orderServiceContract = /* ... */;

// contracts/index.ts
export * from "./user-service";
export * from "./order-service";
```

Then, services can import these contracts:

```typescript
import { userServiceContract } from "@mycompany/contracts";
```

## Best Practices

When designing contracts, follow these best practices:

1. **Be Explicit**: Define all events, requests, and errors clearly
2. **Keep Schemas Focused**: Each event or request should have a single responsibility
3. **Use Descriptive Names**: Names should indicate the purpose and content
4. **Include Documentation**: Add comments and descriptions to explain the purpose
5. **Define Errors**: Include all possible error codes and messages
6. **Make Breaking Changes Explicit**: Version contracts when making breaking changes
7. **Share Contracts**: Use a shared package or repository for contracts

## Next Steps

Now that you understand contracts, explore these related topics:

- [Transport Adapters](transport): Learn how messages are transmitted between services
- [Client and Server](client-server): Understand how to use clients and servers with contracts
- [Message Context](message-context): Learn how to pass metadata with messages