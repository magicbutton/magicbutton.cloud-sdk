---
sidebar_position: 2
---

# Request Models

This page documents the request models used to make API calls with the Magic Button Cloud SDK.

## Common Request Patterns

### Create Resource Request

Requests to create new resources typically follow this pattern:

```typescript
interface CreateResourceRequest {
  // Required fields for resource creation
  name: string;
  description?: string;
  type: 'type1' | 'type2' | 'type3';
  
  // Additional attributes specific to the resource type
  attributes?: Record<string, any>;
  
  // Metadata (optional)
  metadata?: Record<string, string>;
}
```

### Update Resource Request

Requests to update existing resources:

```typescript
interface UpdateResourceRequest {
  // Resource ID to update
  id: string;
  
  // Fields to update (all optional)
  name?: string;
  description?: string;
  type?: 'type1' | 'type2' | 'type3';
  
  // Additional attributes to update
  attributes?: Record<string, any>;
  
  // Metadata to update
  metadata?: Record<string, string>;
}
```

### List Resources Request

Requests to list resources with filtering and pagination:

```typescript
interface ListResourcesRequest {
  // Pagination
  limit?: number;
  cursor?: string;
  
  // Filtering
  type?: 'type1' | 'type2' | 'type3';
  status?: 'active' | 'inactive' | 'pending';
  createdAfter?: string; // ISO 8601 date
  createdBefore?: string; // ISO 8601 date
  
  // Sorting
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
```

## Specific Request Models

Below are examples of specific request models for different API operations:

### `OperationOneRequest`

```typescript
interface OperationOneRequest {
  // Required parameters
  resourceId: string;
  action: 'start' | 'stop' | 'restart';
  
  // Optional parameters
  timeout?: number;
  options?: {
    notifyOnCompletion?: boolean;
    priority?: 'low' | 'normal' | 'high';
  };
}
```

### `OperationTwoRequest`

```typescript
interface OperationTwoRequest {
  // Required parameters
  items: Array<{
    id: string;
    quantity: number;
  }>;
  
  // Optional parameters
  customerRef?: string;
  notes?: string;
}
```

### `UploadFileRequest`

```typescript
interface UploadFileRequest {
  // File content (Buffer or Blob)
  file: Buffer | Blob;
  
  // File metadata
  fileName: string;
  contentType: string;
  
  // Optional parameters
  folder?: string;
  tags?: string[];
  isPublic?: boolean;
}
```

## Using Request Models

Here are examples of how to use these request models with the SDK:

### Creating a Resource

```typescript
import { MagicButtonClient, CreateResourceRequest } from '@magicbutton/cloud-sdk';

async function createNewResource() {
  const client = new MagicButtonClient({
    apiKey: 'your-api-key',
  });
  
  const request: CreateResourceRequest = {
    name: 'My New Resource',
    description: 'This is a description of my resource',
    type: 'type1',
    attributes: {
      color: 'blue',
      size: 'medium',
      features: ['feature1', 'feature2'],
    },
    metadata: {
      createdBy: 'user123',
      department: 'engineering',
    },
  };
  
  const resource = await client.createResource(request);
  return resource;
}
```

### Updating a Resource

```typescript
import { MagicButtonClient, UpdateResourceRequest } from '@magicbutton/cloud-sdk';

async function updateExistingResource(resourceId: string) {
  const client = new MagicButtonClient({
    apiKey: 'your-api-key',
  });
  
  const request: UpdateResourceRequest = {
    id: resourceId,
    name: 'Updated Resource Name',
    attributes: {
      color: 'red', // Update specific attribute
    },
  };
  
  const updatedResource = await client.updateResource(request);
  return updatedResource;
}
```

### Listing Resources

```typescript
import { MagicButtonClient, ListResourcesRequest } from '@magicbutton/cloud-sdk';

async function listActiveResources() {
  const client = new MagicButtonClient({
    apiKey: 'your-api-key',
  });
  
  const request: ListResourcesRequest = {
    limit: 100,
    status: 'active',
    sortBy: 'createdAt',
    sortDirection: 'desc',
  };
  
  const response = await client.listResources(request);
  return response.items;
}
```