---
sidebar_position: 2
---

# Quick Start

This guide will help you get started with the Magic Button Cloud SDK quickly. By the end of this guide, you'll have a basic understanding of how to use the SDK to interact with the Magic Button Cloud API.

## Initialize the Client

First, you need to initialize the Magic Button client with your API key:

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';

const client = new MagicButtonClient({
  apiKey: 'your-api-key',
});
```

## Basic Usage Example

Here's a simple example that demonstrates how to use the client:

```typescript
async function main() {
  try {
    // Example API call
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

main();
```

## Error Handling

The SDK provides comprehensive error handling. Here's how you can handle errors:

```typescript
try {
  const result = await client.someOperation({
    // params
  });
} catch (error) {
  if (error instanceof MagicButtonError) {
    console.error('API Error:', error.message);
    console.error('Error Code:', error.code);
    console.error('HTTP Status:', error.status);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Using TypeScript

The Magic Button Cloud SDK is built with TypeScript and provides full type definitions. This gives you excellent IDE support with autocompletion and type checking:

```typescript
import { MagicButtonClient, OperationParams } from '@magicbutton/cloud-sdk';

// Parameters are fully typed
const params: OperationParams = {
  param1: 'value1',
  param2: 'value2',
};

// Result is also fully typed
const result = await client.operation(params);
```

## Next Steps

Now that you have a basic understanding of how to use the Magic Button Cloud SDK:

- [Learn about authentication](authentication)
- [Explore advanced features](/docs/guides/advanced-features)
- [See the API reference](/docs/api/overview)