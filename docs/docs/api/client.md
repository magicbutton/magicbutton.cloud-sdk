---
sidebar_position: 2
---

# Client

The `MagicButtonClient` is the main entry point for interacting with the Magic Button Cloud API.

## Initialization

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';

const client = new MagicButtonClient({
  apiKey: 'your-api-key',
});
```

## Configuration Options

The client constructor accepts the following options:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | string | Yes | - | Your Magic Button API key |
| `baseUrl` | string | No | `'https://api.magicbutton.cloud'` | The base URL for API requests |
| `timeout` | number | No | `30000` | Request timeout in milliseconds |
| `retries` | number | No | `3` | Number of retry attempts for failed requests |
| `debug` | boolean | No | `false` | Enable debug logging |

## Methods

The client provides the following methods for interacting with the API:

### Core Operations

- `client.operation1(params)`: Description of operation 1
- `client.operation2(params)`: Description of operation 2
- `client.operation3(params)`: Description of operation 3

See the [Operations](operations) page for detailed documentation of all available operations.

## Usage Example

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';

async function example() {
  // Initialize client
  const client = new MagicButtonClient({
    apiKey: 'your-api-key',
    timeout: 60000, // 60 seconds
  });

  try {
    // Make API call
    const result = await client.someOperation({
      // parameters
    });

    console.log('Operation successful:', result);
  } catch (error) {
    console.error('Operation failed:', error);
  }
}
```

## Advanced Configuration

### Custom Fetch Implementation

You can provide a custom fetch implementation:

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';
import nodeFetch from 'node-fetch';

const client = new MagicButtonClient({
  apiKey: 'your-api-key',
  fetchImplementation: nodeFetch,
});
```

### Custom Headers

You can add custom headers to all requests:

```typescript
const client = new MagicButtonClient({
  apiKey: 'your-api-key',
  headers: {
    'X-Custom-Header': 'custom-value',
  },
});
```

### Custom Authentication

For advanced scenarios, you can provide a custom authentication provider:

```typescript
import { MagicButtonClient, CustomAuthProvider } from '@magicbutton/cloud-sdk';

const authProvider: CustomAuthProvider = {
  getAuthHeader: async () => {
    // Custom logic to get authentication header
    return { 'Authorization': 'Bearer your-custom-token' };
  }
};

const client = new MagicButtonClient({
  auth: authProvider,
});
```