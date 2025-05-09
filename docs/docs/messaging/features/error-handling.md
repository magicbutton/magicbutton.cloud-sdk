---
sidebar_position: 3
---

# Error Handling

Effective error handling is essential for building robust distributed systems. Magic Button Messaging provides a comprehensive error handling system that helps you manage errors consistently across your application.

## Error Handling Philosophy

Magic Button Messaging's error handling is designed around these principles:

1. **Type Safety**: Errors are strongly typed for better developer experience
2. **Standardization**: Errors follow a consistent format across the application
3. **Rich Context**: Errors include detailed information for troubleshooting
4. **Business Focus**: Errors are categorized by their business impact
5. **Client-Friendly**: Errors can be easily serialized and deserialized across network boundaries

## Error Types

Magic Button Messaging defines several error types:

### MessagingError

The base error class that all other error types extend:

```typescript
export class MessagingError extends Error {
  code: string;            // Error code
  message: string;         // Error message
  details?: any;           // Additional details
  metadata?: ErrorMetadata; // Error metadata
  
  // Methods
  isType(type: ErrorType): boolean;
  hasSeverity(severity: ErrorSeverity): boolean;
  isRetryable(): boolean;
  toResponseError(): ResponseError;
}
```

### ErrorMetadata

Additional information about an error:

```typescript
export interface ErrorMetadata {
  type: ErrorType;           // Error type (e.g., "business", "system", "transport")
  severity: ErrorSeverity;   // Error severity (e.g., "error", "warning", "critical")
  statusCode?: number;       // HTTP status code (for HTTP transports)
  source?: string;           // Error source (e.g., service name)
  businessImpact?: string;   // Business impact (e.g., "low", "medium", "high")
  retry?: RetryOptions;      // Retry options
  requiredAction?: string;   // Action needed to resolve the error
  documentationUrl?: string; // URL to error documentation
}
```

### Error Type Enum

Categorizes errors by their nature:

```typescript
export enum ErrorType {
  BUSINESS = "business",  // Business rule violation
  SYSTEM = "system",      // System or infrastructure error
  VALIDATION = "validation", // Validation error
  TRANSPORT = "transport", // Communication error
  SECURITY = "security",  // Security-related error
  UNKNOWN = "unknown"     // Unknown error
}
```

### Error Severity Enum

Indicates the severity of an error:

```typescript
export enum ErrorSeverity {
  INFO = "info",         // Informational message
  WARNING = "warning",   // Warning, non-critical error
  ERROR = "error",       // Standard error
  CRITICAL = "critical"  // Critical error requiring immediate attention
}
```

## Error Registry

The `ErrorRegistry` class manages error definitions, allowing you to define and create errors consistently:

```typescript
import { ErrorRegistry, ErrorType, ErrorSeverity } from "@magicbutton.cloud/messaging";

// Create an error registry
const errorRegistry = new ErrorRegistry();

// Register error definitions
errorRegistry.register({
  code: "user_not_found",
  message: "User with ID {userId} not found",
  metadata: {
    type: ErrorType.BUSINESS,
    severity: ErrorSeverity.ERROR,
    statusCode: 404,
    retry: {
      retryable: false
    }
  }
});

errorRegistry.register({
  code: "payment_processing_failed",
  message: "Payment processing failed: {reason}",
  metadata: {
    type: ErrorType.BUSINESS,
    severity: ErrorSeverity.ERROR,
    statusCode: 400,
    businessImpact: "high",
    retry: {
      retryable: true,
      delayMs: 5000,
      maxRetries: 3
    }
  }
});

// Register multiple errors at once
errorRegistry.registerMany([
  {
    code: "insufficient_inventory",
    message: "Insufficient inventory for product {productId}. Requested: {requested}, Available: {available}",
    metadata: {
      type: ErrorType.BUSINESS,
      severity: ErrorSeverity.ERROR,
      statusCode: 400,
      businessImpact: "medium",
      retry: {
        retryable: false
      }
    }
  },
  {
    code: "invalid_payment_method",
    message: "Invalid payment method: {method}",
    metadata: {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.ERROR,
      statusCode: 400,
      retry: {
        retryable: false
      }
    }
  }
]);
```

### Creating Errors

The error registry allows you to create error instances with parameter substitution:

```typescript
// Create an error
const error = errorRegistry.createError("user_not_found", {
  params: { userId: "user-123" }
});

console.log(error.message); // "User with ID user-123 not found"
console.log(error.code); // "user_not_found"
console.log(error.isType(ErrorType.BUSINESS)); // true
console.log(error.hasSeverity(ErrorSeverity.ERROR)); // true
console.log(error.isRetryable()); // false

// Create an error with details
const paymentError = errorRegistry.createError("payment_processing_failed", {
  params: { reason: "Gateway timeout" },
  details: {
    transactionId: "txn-456",
    gateway: "stripe",
    errorCode: "gateway_timeout"
  }
});
```

## System Error Handling

Magic Button Messaging registers system-level errors automatically:

```typescript
// System errors are registered automatically
const systemErrors = {
  INTERNAL_ERROR: {
    code: "internal_error",
    message: "An internal error occurred: {message}",
    metadata: {
      type: ErrorType.SYSTEM,
      severity: ErrorSeverity.ERROR,
      statusCode: 500,
      retry: {
        retryable: true,
        delayMs: 1000,
        maxRetries: 3
      }
    }
  },
  TRANSPORT_ERROR: {
    code: "transport_error",
    message: "Transport error: {message}",
    metadata: {
      type: ErrorType.TRANSPORT,
      severity: ErrorSeverity.ERROR,
      statusCode: 503,
      retry: {
        retryable: true,
        delayMs: 2000,
        maxRetries: 5
      }
    }
  },
  VALIDATION_ERROR: {
    code: "validation_error",
    message: "Validation error: {message}",
    metadata: {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.ERROR,
      statusCode: 400,
      retry: {
        retryable: false
      }
    }
  },
  // ... more system errors
};
```

## Handling Errors in Clients

When using a client, you can catch errors and handle them appropriately:

```typescript
import { Client, InMemoryTransport, MessagingError } from "@magicbutton.cloud/messaging";

// Create a client
const client = new Client(new InMemoryTransport());
await client.connect("memory://order-service");

// Basic error handling
try {
  const order = await client.request("getOrderById", { 
    orderId: "order-123" 
  });
  
  console.log("Order found:", order);
} catch (error) {
  if (error instanceof MessagingError) {
    console.error(`Error (${error.code}): ${error.message}`);
    
    // Handle specific error codes
    if (error.code === "order_not_found") {
      // Handle not found case
      showNotFoundMessage(error.message);
    } else if (error.isType(ErrorType.VALIDATION)) {
      // Handle validation errors
      showValidationErrors(error.details);
    } else if (error.isRetryable()) {
      // Maybe retry the request
      retryRequest();
    }
  } else {
    // Handle unexpected errors
    console.error("Unexpected error:", error);
  }
}
```

## Error Handling Utilities

Magic Button Messaging provides utilities to make error handling more consistent:

### toMessagingError

Converts any error to a MessagingError:

```typescript
import { toMessagingError } from "@magicbutton.cloud/messaging";

try {
  // Some operation that might throw a non-MessagingError
  const result = await fetchDataFromExternalApi();
  return result;
} catch (error) {
  // Convert to MessagingError
  throw toMessagingError(error, "external_api_error");
}
```

### tryCatch

A utility for cleaner error handling:

```typescript
import { tryCatch } from "@magicbutton.cloud/messaging";

// Use tryCatch for cleaner error handling
const result = await tryCatch(async () => {
  // Operation that might throw
  const user = await userService.findById("user-123");
  return user;
});

if (result.success) {
  // Operation succeeded
  console.log("User found:", result.result);
} else {
  // Operation failed
  console.error("Error finding user:", result.error.message);
}
```

### retry

A utility for retrying operations with configurable backoff:

```typescript
import { retry } from "@magicbutton.cloud/messaging";

// Retry an operation with backoff
const result = await retry(
  // The operation to retry
  async () => {
    return paymentGateway.processPayment({
      amount: 99.99,
      currency: "USD",
      paymentMethod: "card",
    });
  },
  // Retry options
  {
    maxRetries: 3,
    initialDelayMs: 1000,
    backoffFactor: 2,
    // Only retry if it's a retryable error
    retryIf: (error) => {
      if (error instanceof MessagingError) {
        return error.isRetryable();
      }
      // Retry on network errors
      return error.name === "NetworkError";
    }
  }
);
```

### handleErrors

A decorator function for consistent error handling:

```typescript
import { handleErrors } from "@magicbutton.cloud/messaging";

class OrderService {
  // Use handleErrors decorator for consistent error handling
  processOrder = handleErrors(
    // The original function
    async (orderData) => {
      // Validate order
      this.validateOrder(orderData);
      
      // Process payment
      const payment = await this.processPayment(orderData.payment);
      
      // Create order
      const order = await this.createOrder({
        ...orderData,
        paymentId: payment.id,
      });
      
      return order;
    },
    // Error handler
    (error) => {
      // Log the error
      logger.error("Order processing failed", error);
      
      // Return a standardized error response
      return {
        success: false,
        error: {
          code: error instanceof MessagingError ? error.code : "unknown_error",
          message: error.message,
          details: error instanceof MessagingError ? error.details : undefined,
        }
      };
    }
  );
}
```

## Error Handling in Servers

In server request handlers, you can throw errors that will be properly converted and sent to clients:

```typescript
import { Server, InMemoryTransport } from "@magicbutton.cloud/messaging";

// Create a server
const server = new Server(new InMemoryTransport());

// Start the server
await server.start("memory://order-service");

// Handle a request with error handling
server.handleRequest("getOrderById", async (payload, context, clientId) => {
  const { orderId } = payload;
  
  // Validate the order ID
  if (!orderId.match(/^order-\d+$/)) {
    // Throw a validation error
    throw errorRegistry.createError("invalid_order_id", {
      params: { orderId }
    });
  }
  
  // Find the order
  const order = await orderRepository.findById(orderId);
  
  if (!order) {
    // Throw a not found error
    throw errorRegistry.createError("order_not_found", {
      params: { orderId }
    });
  }
  
  return order;
});
```

## Error Middleware

You can create middleware to handle errors consistently:

```typescript
import { RequestMiddleware } from "@magicbutton.cloud/messaging";

// Create an error handling middleware
const errorHandlingMiddleware: RequestMiddleware = async (request, next) => {
  try {
    // Try to process the request
    return await next(request);
  } catch (error) {
    // Convert to MessagingError if needed
    const messagingError = error instanceof MessagingError 
      ? error 
      : toMessagingError(error);
    
    // Log the error
    logger.error(`Error processing request ${request.type}`, {
      error: {
        code: messagingError.code,
        message: messagingError.message,
        details: messagingError.details,
        type: messagingError.metadata?.type,
        severity: messagingError.metadata?.severity,
      },
      context: {
        requestId: request.context?.id,
        traceId: request.context?.traceId,
        spanId: request.context?.spanId,
      },
    });
    
    // Return a standardized error response
    return {
      success: false,
      error: messagingError.toResponseError(),
      context: request.context,
    };
  }
};

// Register the middleware
middlewareManager.useGlobalRequestMiddleware(errorHandlingMiddleware);
```

## Error Patterns

Here are some common error handling patterns in Magic Button Messaging:

### Categorizing Errors

Group errors into logical categories:

```typescript
// Business errors
errorRegistry.registerMany([
  {
    code: "order_not_found",
    message: "Order not found",
    metadata: { type: ErrorType.BUSINESS, /* ... */ }
  },
  {
    code: "insufficient_inventory",
    message: "Insufficient inventory",
    metadata: { type: ErrorType.BUSINESS, /* ... */ }
  },
]);

// Validation errors
errorRegistry.registerMany([
  {
    code: "invalid_email",
    message: "Invalid email format",
    metadata: { type: ErrorType.VALIDATION, /* ... */ }
  },
  {
    code: "invalid_phone",
    message: "Invalid phone number",
    metadata: { type: ErrorType.VALIDATION, /* ... */ }
  },
]);

// System errors
errorRegistry.registerMany([
  {
    code: "database_connection_error",
    message: "Failed to connect to database",
    metadata: { type: ErrorType.SYSTEM, /* ... */ }
  },
  {
    code: "cache_failure",
    message: "Cache operation failed",
    metadata: { type: ErrorType.SYSTEM, /* ... */ }
  },
]);
```

### Error Handling Strategy

Implement a consistent error handling strategy:

```typescript
// Generic error handler function
function handleServiceError(error, operation) {
  // Convert to MessagingError if needed
  const messagingError = error instanceof MessagingError 
    ? error 
    : toMessagingError(error);
  
  // Log based on severity
  if (messagingError.hasSeverity(ErrorSeverity.CRITICAL)) {
    logger.critical(`Critical error during ${operation}`, messagingError);
    // Trigger alerts for critical errors
    alerting.triggerAlert("CRITICAL_ERROR", {
      operation,
      error: messagingError,
    });
  } else if (messagingError.hasSeverity(ErrorSeverity.ERROR)) {
    logger.error(`Error during ${operation}`, messagingError);
  } else {
    logger.warn(`Warning during ${operation}`, messagingError);
  }
  
  // Handle based on type
  if (messagingError.isType(ErrorType.BUSINESS)) {
    // Business errors are expected and can be shown to users
    return {
      success: false,
      error: messagingError.toResponseError(),
    };
  } else if (messagingError.isType(ErrorType.VALIDATION)) {
    // Validation errors include details about what failed
    return {
      success: false,
      error: messagingError.toResponseError(),
      validationIssues: messagingError.details,
    };
  } else {
    // System/unknown errors should not expose internal details
    return {
      success: false,
      error: {
        code: "operation_failed",
        message: `The ${operation} operation failed. Please try again later.`,
      },
    };
  }
}
```

### Retry Strategy

Implement a consistent retry strategy:

```typescript
// Create a function with retry logic
async function executeWithRetry(operation, options = {}) {
  return retry(
    operation,
    {
      maxRetries: options.maxRetries || 3,
      initialDelayMs: options.initialDelayMs || 1000,
      backoffFactor: options.backoffFactor || 2,
      retryIf: (error) => {
        // Only retry if the error is marked as retryable
        if (error instanceof MessagingError) {
          return error.isRetryable();
        }
        
        // For non-MessagingErrors, only retry network-related errors
        return isNetworkError(error);
      },
      onRetry: (error, attempt) => {
        logger.warn(`Retrying operation after error (attempt ${attempt})`, {
          error: error instanceof MessagingError 
            ? { code: error.code, message: error.message } 
            : { message: error.message },
        });
      },
    }
  );
}

// Use the retry function
const result = await executeWithRetry(
  async () => paymentGateway.processPayment(paymentData)
);
```

## Exposing Errors to Clients

When exposing errors to clients, consider security implications:

```typescript
// Safe error mapping for external clients
function mapErrorForExternalClient(error) {
  const messagingError = toMessagingError(error);
  
  // For business and validation errors, expose the actual error
  if (messagingError.isType(ErrorType.BUSINESS) || 
      messagingError.isType(ErrorType.VALIDATION)) {
    return {
      code: messagingError.code,
      message: messagingError.message,
      details: messagingError.isType(ErrorType.VALIDATION) 
        ? messagingError.details 
        : undefined,
    };
  }
  
  // For system errors, don't expose internal details
  return {
    code: "operation_failed",
    message: "The operation failed. Please try again later.",
  };
}

// In an API endpoint
app.post('/api/orders', async (req, res) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.json(order);
  } catch (error) {
    // Map error for external clients
    const clientError = mapErrorForExternalClient(error);
    
    // Determine HTTP status code
    const statusCode = error instanceof MessagingError && error.metadata?.statusCode
      ? error.metadata.statusCode
      : 500;
    
    res.status(statusCode).json({
      error: clientError
    });
  }
});
```

## Best Practices

1. **Define Domain-Specific Errors**: Create error types specific to your business domain
2. **Use Consistent Error Codes**: Use a consistent naming convention for error codes
3. **Include Contextual Information**: Provide enough details to understand the error
4. **Categorize Errors Properly**: Use the appropriate error type and severity
5. **Handle Errors at Boundaries**: Catch and handle errors at system boundaries
6. **Log All Errors**: Log errors with appropriate context for troubleshooting
7. **Consider Security**: Don't expose sensitive information in error messages
8. **Implement Retries Carefully**: Only retry operations that are safe to retry

## Next Steps

Now that you understand error handling, explore these related topics:

- [Middleware](middleware): Implement error handling middleware
- [Observability](observability): Log and monitor errors for troubleshooting
- [Contracts](../core-concepts/contracts): Define error codes in your contracts