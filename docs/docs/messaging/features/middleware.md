---
sidebar_position: 2
---

# Middleware

Middleware is a powerful feature in Magic Button Messaging that allows you to intercept and modify messages as they flow through your system. Middleware can be used for cross-cutting concerns like validation, logging, authentication, error handling, and more.

## What is Middleware?

In Magic Button Messaging, middleware functions are executed in a chain before and after message processing. There are two types of middleware:

1. **Event Middleware**: Processes event messages (one-way messages)
2. **Request Middleware**: Processes request/response messages (two-way messages)

Middleware functions receive the message, can modify it, and then pass it to the next middleware in the chain. This allows you to build a pipeline of operations that are applied to every message.

## Middleware Manager

The `MiddlewareManager` class manages middleware execution. It allows you to:

- Register global middleware for all messages
- Register specific middleware for particular message types
- Process messages through the middleware chain

```typescript
import { MiddlewareManager } from "@magicbutton.cloud/messaging";

// Create a middleware manager
const middlewareManager = new MiddlewareManager();
```

## Event Middleware

Event middleware functions receive an event payload and a next function:

```typescript
import { EventMiddleware } from "@magicbutton.cloud/messaging";

// Create an event logging middleware
const eventLoggingMiddleware: EventMiddleware = async (event, next) => {
  console.log(`Event received: ${event.type}`, event.payload);
  
  // Call the next middleware in the chain
  await next(event);
  
  console.log(`Event processed: ${event.type}`);
};

// Register the middleware for all events
middlewareManager.useGlobalEventMiddleware(eventLoggingMiddleware);

// Register the middleware for a specific event type
middlewareManager.useEventMiddleware("userCreated", eventLoggingMiddleware);
```

### Processing Events with Middleware

To process an event through the middleware chain:

```typescript
// Process an event
await middlewareManager.processEvent({
  type: "userCreated",
  payload: {
    id: "user-123",
    email: "user@example.com",
    createdAt: Date.now(),
  },
  context: {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    source: "user-service",
  },
});
```

## Request Middleware

Request middleware functions receive a request payload and a next function:

```typescript
import { RequestMiddleware } from "@magicbutton.cloud/messaging";

// Create a request logging middleware
const requestLoggingMiddleware: RequestMiddleware = async (request, next) => {
  console.log(`Request received: ${request.type}`, request.payload);
  const startTime = Date.now();
  
  // Call the next middleware in the chain
  const response = await next(request);
  
  const duration = Date.now() - startTime;
  console.log(`Request processed: ${request.type} in ${duration}ms`);
  
  return response;
};

// Register the middleware for all requests
middlewareManager.useGlobalRequestMiddleware(requestLoggingMiddleware);

// Register the middleware for a specific request type
middlewareManager.useRequestMiddleware("getUserById", requestLoggingMiddleware);
```

### Processing Requests with Middleware

To process a request through the middleware chain:

```typescript
// Process a request
const response = await middlewareManager.processRequest({
  type: "getUserById",
  payload: {
    id: "user-123",
  },
  context: {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    source: "client-app",
    target: "user-service",
  },
});
```

## Built-in Middleware Functions

Magic Button Messaging includes several built-in middleware functions:

### Validation Middleware

The validation middleware validates payloads against your contract schemas:

```typescript
import { createEventValidationMiddleware, createRequestValidationMiddleware } from "@magicbutton.cloud/messaging";
import { userServiceContract } from "./contracts/user-service";

// Create validation middleware for events
const eventValidationMiddleware = createEventValidationMiddleware(
  userServiceContract.events
);

// Create validation middleware for requests
const requestValidationMiddleware = createRequestValidationMiddleware(
  userServiceContract.requests
);

// Register the middleware
middlewareManager.useGlobalEventMiddleware(eventValidationMiddleware);
middlewareManager.useGlobalRequestMiddleware(requestValidationMiddleware);
```

This middleware:
- Validates event payloads against your event schemas
- Validates request payloads against your request schemas
- Validates response payloads against your response schemas
- Provides detailed validation error messages

### Logging Middleware

The logging middleware logs events and requests:

```typescript
import { createEventLoggingMiddleware, createRequestLoggingMiddleware } from "@magicbutton.cloud/messaging";

// Create logging middleware
const eventLoggingMiddleware = createEventLoggingMiddleware();
const requestLoggingMiddleware = createRequestLoggingMiddleware();

// Register the middleware
middlewareManager.useGlobalEventMiddleware(eventLoggingMiddleware);
middlewareManager.useGlobalRequestMiddleware(requestLoggingMiddleware);
```

This middleware:
- Logs when events and requests are received
- Logs when events and requests are processed
- Includes timing information
- Includes trace IDs for distributed tracing

### Authentication Middleware

The authentication middleware checks if requests are authenticated:

```typescript
import { createAuthenticationMiddleware } from "@magicbutton.cloud/messaging";

// Create authentication middleware
const authMiddleware = createAuthenticationMiddleware(
  // Authentication check function
  async (context) => {
    if (!context.auth?.token) {
      return false;
    }
    
    // Verify the token (example implementation)
    try {
      const tokenPayload = await verifyToken(context.auth.token);
      return true;
    } catch (error) {
      return false;
    }
  },
  // Options
  {
    exclude: ["login", "register", "publicEndpoint"] // Exclude these request types
  }
);

// Register the middleware
middlewareManager.useGlobalRequestMiddleware(authMiddleware);
```

This middleware:
- Checks if requests are authenticated
- Can exclude certain request types from authentication
- Returns a standardized error for unauthenticated requests

## Creating Custom Middleware

You can create custom middleware for specific needs:

### Custom Event Middleware Examples

#### Filtering Events

```typescript
// Create a middleware that filters events based on criteria
const eventFilterMiddleware: EventMiddleware = async (event, next) => {
  // Apply filtering logic
  if (event.type === "logEntry" && event.payload.level === "debug") {
    // Skip debug logs in production
    if (process.env.NODE_ENV === "production") {
      return; // Don't call next, ending the middleware chain
    }
  }
  
  // Continue for other events
  await next(event);
};
```

#### Enriching Events

```typescript
// Create a middleware that enriches events with additional data
const eventEnrichmentMiddleware: EventMiddleware = async (event, next) => {
  // Add server information to the event payload
  const enrichedPayload = {
    ...event.payload,
    _metadata: {
      serverHostname: os.hostname(),
      serverTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    }
  };
  
  // Continue with the enriched event
  await next({
    ...event,
    payload: enrichedPayload
  });
};
```

#### Rate Limiting

```typescript
// Create a middleware that implements rate limiting
const rateLimitMiddleware: EventMiddleware = async (event, next) => {
  // Check rate limits
  const key = `event:${event.type}:${event.context?.source || 'unknown'}`;
  const allowed = await rateLimiter.check(key, {
    maxRequests: 100,
    windowMs: 60 * 1000,
  });
  
  if (!allowed) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  }
  
  // Continue if within rate limits
  await next(event);
};
```

### Custom Request Middleware Examples

#### Request Timeout

```typescript
// Create a middleware that implements request timeouts
const timeoutMiddleware: RequestMiddleware = async (request, next) => {
  // Get the timeout value (default to 30 seconds)
  const timeout = request.metadata?.timeout || 30000;
  
  // Create a promise that rejects after the timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("REQUEST_TIMEOUT"));
    }, timeout);
  });
  
  // Race the timeout against the actual request
  try {
    const response = await Promise.race([
      next(request),
      timeoutPromise
    ]);
    
    return response;
  } catch (error) {
    if (error.message === "REQUEST_TIMEOUT") {
      return {
        success: false,
        error: {
          code: "REQUEST_TIMEOUT",
          message: `Request timed out after ${timeout}ms`,
        },
        context: request.context,
      };
    }
    
    throw error;
  }
};
```

#### Request Caching

```typescript
// Create a middleware that implements request caching
const cachingMiddleware: RequestMiddleware = async (request, next) => {
  // Only cache GET-like requests
  if (!["getUser", "getProduct", "getOrder"].includes(request.type)) {
    return next(request);
  }
  
  // Generate a cache key
  const cacheKey = `${request.type}:${JSON.stringify(request.payload)}`;
  
  // Check if we have a cached response
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Get the fresh response
  const response = await next(request);
  
  // Cache the successful response
  if (response.success) {
    cache.set(cacheKey, response, { ttl: 60 * 1000 }); // 1 minute TTL
  }
  
  return response;
};
```

#### Authorization Middleware

```typescript
import { createAccessControl } from "@magicbutton.cloud/messaging";
import { documentSystem } from "./access-control";

// Create access control instance
const accessControl = createAccessControl(documentSystem);

// Create authorization middleware
const authorizationMiddleware: RequestMiddleware = async (request, next) => {
  // Define required permissions for each request type
  const permissionMap = {
    "getDocument": "document:read",
    "updateDocument": "document:update",
    "deleteDocument": "document:delete",
    "shareDocument": "document:share",
  };
  
  // Get the required permission
  const requiredPermission = permissionMap[request.type];
  
  // Skip if no permission is required
  if (!requiredPermission) {
    return next(request);
  }
  
  // Get the actor from the context
  const actor = request.context?.auth?.actor;
  
  // Check if the actor exists
  if (!actor) {
    return {
      success: false,
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required for this request",
      },
      context: request.context,
    };
  }
  
  // Check permissions
  if (!accessControl.hasPermission(actor, requiredPermission)) {
    return {
      success: false,
      error: {
        code: "PERMISSION_DENIED",
        message: `Permission denied: ${requiredPermission} is required`,
      },
      context: request.context,
    };
  }
  
  // Actor has permission, proceed
  return next(request);
};
```

## Middleware Order and Composition

The order of middleware registration is important. Middleware functions are executed in the order they're registered:

```typescript
// Order matters! These will execute in sequence:
middlewareManager.useGlobalRequestMiddleware(loggingMiddleware); // 1. Log the request
middlewareManager.useGlobalRequestMiddleware(authMiddleware);    // 2. Authenticate
middlewareManager.useGlobalRequestMiddleware(validationMiddleware); // 3. Validate
middlewareManager.useGlobalRequestMiddleware(businessLogicMiddleware); // 4. Apply business logic
```

You can also compose middleware functions to create more complex behavior:

```typescript
// Compose middleware functions
function composeMiddleware(...middlewares) {
  return async (message, next) => {
    // Create a chain of middleware functions
    const chain = middlewares.reduceRight(
      (nextMiddleware, middleware) => {
        return async (msg) => middleware(msg, nextMiddleware);
      },
      next
    );
    
    // Execute the chain
    return chain(message);
  };
}

// Use the composed middleware
const combinedMiddleware = composeMiddleware(
  loggingMiddleware,
  authMiddleware,
  validationMiddleware
);

middlewareManager.useGlobalRequestMiddleware(combinedMiddleware);
```

## Middleware and Transport Adapters

Middleware can be used with transport adapters to extend their functionality:

```typescript
import { Server, InMemoryTransport, MiddlewareManager } from "@magicbutton.cloud/messaging";

// Create a transport adapter
const transport = new InMemoryTransport();

// Create a middleware manager
const middlewareManager = new MiddlewareManager();

// Register middleware
middlewareManager.useGlobalEventMiddleware(eventLoggingMiddleware);
middlewareManager.useGlobalRequestMiddleware(requestLoggingMiddleware);
middlewareManager.useGlobalRequestMiddleware(authMiddleware);
middlewareManager.useGlobalRequestMiddleware(validationMiddleware);

// Create a server
const server = new Server(transport);

// Use middleware in server request handlers
server.handleRequest("getDocument", async (payload, context, clientId) => {
  // Process the request through middleware
  const request = {
    type: "getDocument",
    payload,
    context,
  };
  
  const response = await middlewareManager.processRequest(request);
  
  // If middleware returned an error, return it
  if (!response.success) {
    throw new Error(response.error.code);
  }
  
  // Otherwise, process the request
  const documentId = payload.documentId;
  const document = await documentRepository.findById(documentId);
  
  return document;
});
```

## Best Practices

1. **Order Matters**: Register middleware in the appropriate order
2. **Keep It Simple**: Each middleware should have a single responsibility
3. **Handle Errors**: Catch and handle errors in middleware
4. **Use Context**: Leverage message context for sharing data between middleware
5. **Avoid Side Effects**: Minimize side effects in middleware
6. **Test Thoroughly**: Write unit tests for middleware functions
7. **Document Custom Middleware**: Document the purpose and behavior of custom middleware

## Next Steps

Now that you understand middleware, explore these related topics:

- [Error Handling](error-handling): Learn how to handle errors in middleware
- [Observability](observability): Implement logging and tracing using middleware
- [Access Control](access-control): Apply access control using middleware