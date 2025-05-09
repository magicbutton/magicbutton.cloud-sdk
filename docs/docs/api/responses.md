---
sidebar_position: 4
---

# Responses

This page documents the response structure for API operations in the Magic Button Cloud SDK.

## Response Structure

Most API operations return a structured response object that follows a consistent pattern.

### Standard Response

```typescript
interface StandardResponse {
  // Unique identifier for the resource
  id: string;
  
  // ISO 8601 timestamp of when the resource was created
  createdAt: string;
  
  // ISO 8601 timestamp of when the resource was last updated
  updatedAt: string;
  
  // Resource-specific properties
  // ...
}
```

### Paginated Response

For operations that return collections of items:

```typescript
interface PaginatedResponse<T> {
  // Array of items in the current page
  items: T[];
  
  // Total count of items across all pages
  totalCount: number;
  
  // Whether there are more pages of results
  hasMore: boolean;
  
  // Token to retrieve the next page (if hasMore is true)
  nextCursor?: string;
}
```

### Operation Response

For operations that perform an action:

```typescript
interface OperationResponse {
  // Whether the operation was successful
  success: boolean;
  
  // Human-readable message about the operation
  message: string;
  
  // Identifier for the operation (for checking status later)
  operationId?: string;
  
  // Current status of the operation
  status?: 'pending' | 'completed' | 'failed';
}
```

## Response Headers

In addition to the response body, the API may include important information in the response headers:

| Header Name | Description |
|-------------|-------------|
| `X-Request-Id` | Unique identifier for the request (useful for support) |
| `X-Rate-Limit-Limit` | The rate limit ceiling for the endpoint |
| `X-Rate-Limit-Remaining` | The number of requests left for the time window |
| `X-Rate-Limit-Reset` | The time at which the rate limit resets (UTC epoch seconds) |

The SDK parses these headers and makes them available in error objects when rate limits are exceeded.

## Working with Responses

### Accessing Response Properties

```typescript
const response = await client.getResource({
  id: 'resource-id',
});

// Access basic properties
console.log('Resource ID:', response.id);
console.log('Created:', response.createdAt);

// Access nested properties (with type safety in TypeScript)
if (response.details && response.details.attributes) {
  console.log('Attributes:', response.details.attributes);
}
```

### Working with Paginated Results

```typescript
// Function to fetch all pages
async function fetchAllItems() {
  let allItems = [];
  let cursor = undefined;
  let hasMore = true;
  
  while (hasMore) {
    const response = await client.listItems({
      limit: 100,
      cursor,
    });
    
    allItems = allItems.concat(response.items);
    hasMore = response.hasMore;
    cursor = response.nextCursor;
  }
  
  return allItems;
}

// Usage
const items = await fetchAllItems();
console.log(`Retrieved ${items.length} items`);
```

### Handling Async Operations

Some operations might be asynchronous and return immediately while processing continues on the server:

```typescript
const response = await client.startAsyncOperation({
  /* params */
});

console.log('Operation started:', response.operationId);

// Check operation status later
const status = await client.getOperationStatus({
  operationId: response.operationId,
});

console.log('Current status:', status.status);
```