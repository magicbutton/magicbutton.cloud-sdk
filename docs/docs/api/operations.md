---
sidebar_position: 3
---

# Operations

This page documents all the operations available in the Magic Button Cloud SDK.

## Core Operations

### `client.operation1(params)`

Description of operation 1.

**Parameters:**

```typescript
interface Operation1Params {
  param1: string;
  param2: number;
  param3?: boolean; // Optional
}
```

**Returns:**

```typescript
interface Operation1Response {
  id: string;
  name: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}
```

**Example:**

```typescript
const result = await client.operation1({
  param1: 'value1',
  param2: 42,
});

console.log('Operation result:', result.id);
```

**Errors:**

- `INVALID_PARAMS`: The request parameters are invalid
- `UNAUTHORIZED`: Invalid or missing API key
- `RESOURCE_NOT_FOUND`: The requested resource doesn't exist

### `client.operation2(params)`

Description of operation 2.

**Parameters:**

```typescript
interface Operation2Params {
  id: string;
  action: 'start' | 'stop' | 'pause';
}
```

**Returns:**

```typescript
interface Operation2Response {
  success: boolean;
  message: string;
}
```

**Example:**

```typescript
const result = await client.operation2({
  id: 'resource-id',
  action: 'start',
});

if (result.success) {
  console.log('Operation succeeded:', result.message);
}
```

## Pagination

Some operations return paginated results. These operations typically accept the following parameters:

```typescript
interface PaginationParams {
  limit?: number; // Number of items per page (default: 20, max: 100)
  cursor?: string; // Cursor for pagination
}
```

And return responses with pagination information:

```typescript
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}
```

**Example:**

```typescript
// Get the first page
const firstPage = await client.listItems({
  limit: 10,
});

console.log('Items:', firstPage.items);
console.log('Total count:', firstPage.totalCount);

// Check if there are more pages
if (firstPage.hasMore && firstPage.nextCursor) {
  // Get the next page
  const nextPage = await client.listItems({
    limit: 10,
    cursor: firstPage.nextCursor,
  });
  
  console.log('Next page items:', nextPage.items);
}
```

## Advanced Operations

### File Upload

For operations that require file uploads:

```typescript
const file = fs.readFileSync('/path/to/file.jpg');

const result = await client.uploadFile({
  file: file,
  fileName: 'file.jpg',
  contentType: 'image/jpeg',
});

console.log('Uploaded file ID:', result.fileId);
```

### Batch Operations

For operations that support batch processing:

```typescript
const result = await client.batchOperation({
  items: [
    { id: 'item1', action: 'update' },
    { id: 'item2', action: 'delete' },
    { id: 'item3', action: 'update' },
  ],
});

console.log('Batch results:', result.results);
```