---
sidebar_position: 1
---

# Common Models

This page documents the common data models used across the Magic Button Cloud SDK.

## Base Models

### `Resource`

The base model for most resources in the system:

```typescript
interface Resource {
  // Unique identifier
  id: string;
  
  // Creation timestamp (ISO 8601)
  createdAt: string;
  
  // Last update timestamp (ISO 8601)
  updatedAt: string;
}
```

### `PaginationParams`

Common pagination parameters:

```typescript
interface PaginationParams {
  // Number of items per page (default: 20, max: 100)
  limit?: number;
  
  // Pagination cursor from previous response
  cursor?: string;
}
```

### `SortParams`

Parameters for sorting results:

```typescript
interface SortParams {
  // Field to sort by
  sortBy?: string;
  
  // Sort direction
  sortDirection?: 'asc' | 'desc';
}
```

## Utility Types

### `DateTimeString`

String representing a date and time in ISO 8601 format:

```typescript
type DateTimeString = string; // Example: "2023-04-01T12:34:56Z"
```

### `UUID`

String representing a UUID:

```typescript
type UUID = string; // Example: "123e4567-e89b-12d3-a456-426614174000"
```

### `JSONValue`

Type representing any valid JSON value:

```typescript
type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | JSONValue[];
```

## Enumeration Types

### `Status`

Common status values:

```typescript
enum Status {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}
```

### `ErrorCode`

Common error codes:

```typescript
enum ErrorCode {
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  VALIDATION_ERROR = 'validation_error',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INTERNAL_ERROR = 'internal_error',
}
```

## Common Parameters

### `IdParam`

Parameter for identifying a resource:

```typescript
interface IdParam {
  // Resource ID
  id: string;
}
```

### `SearchParams`

Common search parameters:

```typescript
interface SearchParams {
  // Search query string
  query?: string;
  
  // Filters for specific fields
  filters?: Record<string, string | string[] | number | boolean>;
}
```

## Using Common Models

These common models are used throughout the SDK to ensure consistency and type safety. Here's an example of how these models might be used together:

```typescript
import { MagicButtonClient, SearchParams, PaginationParams, SortParams } from '@magicbutton/cloud-sdk';

async function searchResources() {
  const client = new MagicButtonClient({
    apiKey: 'your-api-key',
  });
  
  // Combine common parameter types
  const params: SearchParams & PaginationParams & SortParams = {
    query: 'example',
    filters: {
      status: 'active',
      category: ['type1', 'type2'],
    },
    limit: 50,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  };
  
  const results = await client.searchResources(params);
  
  return results;
}
```