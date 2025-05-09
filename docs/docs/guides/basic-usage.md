---
sidebar_position: 1
---

# Basic Usage

This guide covers the fundamental patterns and practices for using the Magic Button Cloud SDK effectively.

## Client Initialization

The first step is to initialize the `MagicButtonClient` with your API key:

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';

const client = new MagicButtonClient({
  apiKey: 'your-api-key',
});
```

### Configuration Options

The client constructor accepts several configuration options:

```typescript
const client = new MagicButtonClient({
  apiKey: 'your-api-key', 
  baseUrl: 'https://api.customdomain.com', // Optional: override API URL
  timeout: 30000, // Optional: request timeout in milliseconds
  retries: 3, // Optional: number of retry attempts
});
```

## Making API Requests

Once you have a client instance, you can make API requests:

```typescript
async function example() {
  try {
    // Example operation
    const result = await client.exampleOperation({
      param1: 'value1',
      param2: 'value2',
    });
    
    console.log('Operation successful:', result);
    
    // Process the result
    // ...
  } catch (error) {
    console.error('Operation failed:', error);
  }
}
```

## Working with Responses

All API operations return structured response objects:

```typescript
const response = await client.exampleOperation({
  // parameters
});

// Access response data
console.log('Response ID:', response.id);
console.log('Created at:', response.createdAt);

// Access nested properties
if (response.items && response.items.length > 0) {
  console.log('First item:', response.items[0]);
}
```

## Error Handling

The SDK provides structured error handling:

```typescript
try {
  const result = await client.someOperation({
    // parameters
  });
} catch (error) {
  if (error instanceof MagicButtonError) {
    console.error('API Error:', error.message);
    console.error('Error Code:', error.code);
    console.error('HTTP Status:', error.status);
    
    // Handle specific error types
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      // Handle rate limiting
      console.log('Retry after:', error.retryAfter);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Pagination

Some operations return paginated results. The SDK provides helper methods to work with pagination:

```typescript
// Get the first page
const firstPage = await client.listItems({
  limit: 10,
});

console.log('Items:', firstPage.items);
console.log('Total count:', firstPage.totalCount);

// Check if there are more pages
if (firstPage.hasMore) {
  // Get the next page
  const nextPage = await client.listItems({
    limit: 10,
    cursor: firstPage.nextCursor,
  });
  
  console.log('Next page items:', nextPage.items);
}
```

## Using TypeScript

For TypeScript users, the SDK provides comprehensive type definitions:

```typescript
import { 
  MagicButtonClient, 
  ExampleParams, 
  ExampleResponse 
} from '@magicbutton/cloud-sdk';

// Parameters are fully typed
const params: ExampleParams = {
  param1: 'value1',
  param2: 'value2',
};

// Result is also fully typed
const result: ExampleResponse = await client.exampleOperation(params);
```

## Next Steps

- [Explore advanced features](advanced-features)
- [Learn about error handling](error-handling)
- [See the API reference](/docs/api/overview)