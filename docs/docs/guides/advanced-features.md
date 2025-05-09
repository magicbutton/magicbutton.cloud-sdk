---
sidebar_position: 2
---

# Advanced Features

This guide covers advanced features and usage patterns for the Magic Button Cloud SDK.

## Customizing the Client

### Configuring Timeouts and Retries

You can customize the client's timeout and retry behavior:

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';

const client = new MagicButtonClient({
  apiKey: 'your-api-key',
  timeout: 60000, // 60 seconds
  retries: 5, // Retry failed requests up to 5 times
  retryDelay: 1000, // Start with 1 second delay between retries
});
```

### Custom Headers

You can add custom headers to all requests:

```typescript
const client = new MagicButtonClient({
  apiKey: 'your-api-key',
  headers: {
    'X-Custom-Header': 'custom-value',
    'X-Application-ID': 'my-app',
  },
});
```

### Custom Fetch Implementation

For environments with specific requirements, you can provide a custom fetch implementation:

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';
import nodeFetch from 'node-fetch';

const client = new MagicButtonClient({
  apiKey: 'your-api-key',
  fetchImplementation: nodeFetch,
});
```

## Handling Long-Running Operations

Some API operations might be asynchronous and take time to complete. The SDK provides tools to handle these long-running operations.

### Polling for Operation Status

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';

async function waitForOperation(operationId, maxAttempts = 30, interval = 2000) {
  const client = new MagicButtonClient({
    apiKey: 'your-api-key',
  });
  
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const status = await client.getOperationStatus({ operationId });
    
    if (status.status === 'completed') {
      return status.result;
    } else if (status.status === 'failed') {
      throw new Error(`Operation failed: ${status.error?.message || 'Unknown error'}`);
    }
    
    // Operation still in progress, wait and try again
    await new Promise(resolve => setTimeout(resolve, interval));
    attempts++;
  }
  
  throw new Error('Operation timed out');
}

// Usage
async function startLongRunningJob() {
  const client = new MagicButtonClient({
    apiKey: 'your-api-key',
  });
  
  // Start the operation
  const operation = await client.startLongOperation({
    // parameters
  });
  
  console.log(`Operation started with ID: ${operation.operationId}`);
  
  // Wait for completion
  const result = await waitForOperation(operation.operationId);
  console.log('Operation completed with result:', result);
}
```

## Working with Streams

For APIs that support streaming responses:

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';

async function streamExample() {
  const client = new MagicButtonClient({
    apiKey: 'your-api-key',
  });
  
  const stream = await client.streamingOperation({
    // parameters
  });
  
  // Process the stream
  for await (const chunk of stream) {
    console.log('Received chunk:', chunk);
    // Process chunk
  }
  
  console.log('Stream completed');
}
```

## Cancelling Requests

You can cancel in-flight requests using an AbortController:

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';

async function cancellableRequest() {
  const client = new MagicButtonClient({
    apiKey: 'your-api-key',
  });
  
  const controller = new AbortController();
  
  // Set a timeout to cancel the request after 5 seconds
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 5000);
  
  try {
    const result = await client.someOperation({
      // parameters
    }, { signal: controller.signal });
    
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.log('Request was cancelled');
    } else {
      throw error;
    }
  }
}
```

## Batch Operations

For efficient processing of multiple items:

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';

async function processBatch() {
  const client = new MagicButtonClient({
    apiKey: 'your-api-key',
  });
  
  const items = [
    { id: 'item1', action: 'update', data: { name: 'Updated Item 1' } },
    { id: 'item2', action: 'delete' },
    { id: 'item3', action: 'update', data: { name: 'Updated Item 3' } },
  ];
  
  const results = await client.batchOperation({ items });
  
  console.log('Batch results:', results);
  
  // Process individual results
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`Item ${items[index].id} processed successfully`);
    } else {
      console.error(`Error processing item ${items[index].id}: ${result.error}`);
    }
  });
}
```

## Webhooks

If your API uses webhooks for event notifications, the SDK provides utilities to verify webhook signatures:

```typescript
import { MagicButtonClient, verifyWebhookSignature } from '@magicbutton/cloud-sdk';

// In your webhook handler
function handleWebhook(req, res) {
  const payload = req.body;
  const signature = req.headers['x-webhook-signature'];
  const webhookSecret = process.env.WEBHOOK_SECRET;
  
  try {
    // Verify the webhook signature
    const isValid = verifyWebhookSignature({
      payload: JSON.stringify(payload),
      signature,
      secret: webhookSecret,
    });
    
    if (!isValid) {
      res.status(401).send('Invalid signature');
      return;
    }
    
    // Process the webhook
    const eventType = payload.event;
    console.log(`Received webhook event: ${eventType}`);
    
    // Handle different event types
    switch (eventType) {
      case 'resource.created':
        // Handle resource creation
        break;
      case 'resource.updated':
        // Handle resource update
        break;
      // Handle other event types
    }
    
    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error processing webhook');
  }
}
```

## Next Steps

- [Learn about error handling](error-handling)
- [Explore the API reference](/docs/api/overview)