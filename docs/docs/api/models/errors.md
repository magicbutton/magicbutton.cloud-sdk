---
sidebar_position: 3
---

# Error Models

This page documents the error models and error handling in the Magic Button Cloud SDK.

## Error Structure

All errors thrown by the SDK extend the base `MagicButtonError` class, which provides consistent error information:

```typescript
class MagicButtonError extends Error {
  // Unique error code
  code: string;
  
  // HTTP status code (if applicable)
  status?: number;
  
  // Additional error details
  details?: Record<string, any>;
  
  // Request ID for support reference
  requestId?: string;
}
```

## Common Error Types

The SDK provides several specific error types for different error scenarios:

### `AuthenticationError`

Thrown when authentication fails:

```typescript
class AuthenticationError extends MagicButtonError {
  code = 'authentication_error';
  status = 401;
}
```

### `ValidationError`

Thrown when request validation fails:

```typescript
class ValidationError extends MagicButtonError {
  code = 'validation_error';
  status = 400;
  
  // Field-specific validation errors
  fieldErrors?: Record<string, string[]>;
}
```

### `RateLimitError`

Thrown when API rate limits are exceeded:

```typescript
class RateLimitError extends MagicButtonError {
  code = 'rate_limit_exceeded';
  status = 429;
  
  // When the rate limit will reset (Unix timestamp)
  retryAfter?: number;
  
  // Current rate limit information
  limit?: number;
  remaining?: number;
}
```

### `ResourceNotFoundError`

Thrown when a requested resource doesn't exist:

```typescript
class ResourceNotFoundError extends MagicButtonError {
  code = 'resource_not_found';
  status = 404;
  
  // The resource type that wasn't found
  resourceType?: string;
  
  // The ID that was requested
  resourceId?: string;
}
```

### `InternalError`

Thrown for server-side errors:

```typescript
class InternalError extends MagicButtonError {
  code = 'internal_error';
  status = 500;
}
```

## Error Codes

The following error codes may be returned by the API:

| Code | Description |
|------|-------------|
| `authentication_error` | Authentication failed (invalid API key) |
| `authorization_error` | The authenticated user doesn't have permission |
| `validation_error` | Request validation failed |
| `resource_not_found` | The requested resource doesn't exist |
| `rate_limit_exceeded` | API rate limit exceeded |
| `internal_error` | An internal server error occurred |
| `service_unavailable` | The service is temporarily unavailable |
| `conflict` | Request conflicts with current state |
| `not_implemented` | The requested functionality isn't implemented |

## Handling Errors

Here are examples of how to handle errors from the SDK:

### Basic Error Handling

```typescript
import { MagicButtonClient, MagicButtonError } from '@magicbutton/cloud-sdk';

async function exampleOperation() {
  const client = new MagicButtonClient({
    apiKey: 'your-api-key',
  });
  
  try {
    const result = await client.someOperation({
      // parameters
    });
    return result;
  } catch (error) {
    if (error instanceof MagicButtonError) {
      console.error(`API Error: ${error.code}`);
      console.error(`Message: ${error.message}`);
      console.error(`Status: ${error.status}`);
      console.error(`Request ID: ${error.requestId}`);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}
```

### Handling Specific Error Types

```typescript
import {
  MagicButtonClient,
  ValidationError,
  ResourceNotFoundError,
  RateLimitError,
  AuthenticationError,
} from '@magicbutton/cloud-sdk';

async function operationWithDetailedErrorHandling() {
  const client = new MagicButtonClient({
    apiKey: 'your-api-key',
  });
  
  try {
    const result = await client.someOperation({
      // parameters
    });
    return result;
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation error:', error.message);
      if (error.fieldErrors) {
        console.error('Field errors:', error.fieldErrors);
      }
    } else if (error instanceof ResourceNotFoundError) {
      console.error(`Resource not found: ${error.resourceType} with ID ${error.resourceId}`);
    } else if (error instanceof RateLimitError) {
      console.error(`Rate limit exceeded. Retry after: ${new Date(error.retryAfter! * 1000)}`);
      console.error(`Limit: ${error.limit}, Remaining: ${error.remaining}`);
      
      // Implement retry with exponential backoff
      // ...
    } else if (error instanceof AuthenticationError) {
      console.error('Authentication failed. Check your API key.');
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}
```

### Implementing Retry Logic

```typescript
import { MagicButtonClient, RateLimitError } from '@magicbutton/cloud-sdk';

async function operationWithRetry(params, maxRetries = 3) {
  const client = new MagicButtonClient({
    apiKey: 'your-api-key',
  });
  
  let retries = 0;
  
  while (true) {
    try {
      const result = await client.someOperation(params);
      return result;
    } catch (error) {
      if (error instanceof RateLimitError && retries < maxRetries) {
        // Calculate backoff time (with jitter for distributed systems)
        const backoffMs = Math.min(
          1000 * Math.pow(2, retries) + Math.random() * 1000,
          60000 // Max 60 seconds
        );
        
        console.log(`Rate limited. Retrying in ${backoffMs}ms (retry ${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        retries++;
      } else {
        throw error;
      }
    }
  }
}
```