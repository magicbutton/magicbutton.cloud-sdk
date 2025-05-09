---
sidebar_position: 3
---

# Error Handling

This guide explains how to effectively handle errors when using the Magic Button Cloud SDK.

## Error Types

The SDK provides a structured approach to error handling with specific error types for different scenarios. All errors thrown by the SDK extend the base `MagicButtonError` class.

```typescript
import {
  MagicButtonClient,
  MagicButtonError,
  AuthenticationError,
  ValidationError,
  ResourceNotFoundError,
  RateLimitError,
  InternalError,
} from '@magicbutton/cloud-sdk';
```

### Common Error Types

| Error Type | Description | HTTP Status |
|------------|-------------|-------------|
| `AuthenticationError` | Authentication failed (invalid API key) | 401 |
| `AuthorizationError` | Insufficient permissions for the operation | 403 |
| `ValidationError` | Invalid request parameters | 400 |
| `ResourceNotFoundError` | The requested resource doesn't exist | 404 |
| `RateLimitError` | API rate limit exceeded | 429 |
| `InternalError` | Server-side error | 500 |
| `ServiceUnavailableError` | Service temporarily unavailable | 503 |

## Basic Error Handling

The most basic approach is to wrap API calls in try/catch blocks:

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
      // This is an error from the SDK
      console.error(`API Error: ${error.code}`);
      console.error(`Message: ${error.message}`);
      console.error(`Status: ${error.status}`);
      console.error(`Request ID: ${error.requestId}`);
    } else {
      // This is some other type of error
      console.error('Unexpected error:', error);
    }
    throw error; // Re-throw or handle as needed
  }
}
```

## Handling Specific Error Types

For more granular control, you can handle specific error types:

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
      // Handle validation errors
      if (error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, messages]) => {
          console.error(`Field '${field}' errors:`, messages);
        });
      }
    } else if (error instanceof ResourceNotFoundError) {
      console.error(`Resource not found: ${error.resourceType} with ID ${error.resourceId}`);
      // Handle not found errors
    } else if (error instanceof RateLimitError) {
      console.error(`Rate limit exceeded. Retry after: ${new Date(error.retryAfter! * 1000)}`);
      // Implement retry logic
    } else if (error instanceof AuthenticationError) {
      console.error('Authentication failed. Check your API key.');
      // Handle authentication errors
    } else {
      console.error('Unexpected error:', error);
    }
    
    // Choose whether to re-throw or return a default value
    throw error;
  }
}
```

## Implementation Patterns

### Error Wrapper Function

Create a reusable wrapper function for API calls:

```typescript
import { MagicButtonClient, MagicButtonError } from '@magicbutton/cloud-sdk';

// Generic API call wrapper
async function callApi<T>(apiCall: () => Promise<T>): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof MagicButtonError) {
      // Log and handle the error
      console.error(`API Error: ${error.code}`);
      console.error(`Message: ${error.message}`);
      
      // Custom handling based on error type
      // ...
    }
    
    // Re-throw the error
    throw error;
  }
}

// Usage
async function example() {
  const client = new MagicButtonClient({
    apiKey: 'your-api-key',
  });
  
  // Use the wrapper
  const result = await callApi(() => 
    client.someOperation({
      // parameters
    })
  );
  
  return result;
}
```

### Retry Logic for Rate Limiting

Implement retry logic for rate limit errors:

```typescript
import { MagicButtonClient, RateLimitError, MagicButtonError } from '@magicbutton/cloud-sdk';

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let retries = 0;
  
  while (true) {
    try {
      return await fn();
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

// Usage
async function example() {
  const client = new MagicButtonClient({
    apiKey: 'your-api-key',
  });
  
  // Use the retry wrapper
  const result = await withRetry(() => 
    client.someOperation({
      // parameters
    })
  );
  
  return result;
}
```

### Error Translator

Translate API errors to application-specific errors:

```typescript
import { MagicButtonClient, MagicButtonError } from '@magicbutton/cloud-sdk';

// Application-specific error classes
class AppError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'AppError';
  }
}

class ValidationFailedError extends AppError {}
class ResourceMissingError extends AppError {}
class PermissionDeniedError extends AppError {}

// Translate API errors to application errors
function translateError(error: MagicButtonError): AppError {
  switch (error.code) {
    case 'validation_error':
      return new ValidationFailedError('The request was invalid', error);
    case 'resource_not_found':
      return new ResourceMissingError('The requested resource was not found', error);
    case 'authorization_error':
      return new PermissionDeniedError('You do not have permission for this action', error);
    default:
      return new AppError(`An error occurred: ${error.message}`, error);
  }
}

// Usage
async function example() {
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
      // Translate API error to application error
      throw translateError(error);
    }
    throw error;
  }
}
```

## Best Practices

1. **Always catch errors** when making API calls
2. **Check error types** to provide appropriate handling
3. **Include request IDs** in logs for easier debugging
4. **Implement retry logic** for rate limiting and transient errors
5. **Provide meaningful error messages** to users
6. **Log detailed error information** for debugging
7. **Consider fallback behavior** for critical operations

## Next Steps

- [Explore basic usage](basic-usage)
- [Learn about advanced features](advanced-features)
- [See the API reference](/docs/api/overview)