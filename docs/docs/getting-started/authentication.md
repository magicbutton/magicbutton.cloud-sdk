---
sidebar_position: 3
---

# Authentication

The Magic Button Cloud SDK requires authentication to access the API. This guide explains how to authenticate your SDK client.

## API Keys

The primary authentication method is using API keys. You can get your API key from the Magic Button Cloud dashboard.

### Getting Your API Key

1. Log in to your Magic Button Cloud account at [https://dashboard.magicbutton.cloud](https://dashboard.magicbutton.cloud)
2. Navigate to the **API Keys** section
3. Create a new API key or use an existing one
4. Copy the API key for use in your application

### Using Your API Key

When initializing the Magic Button client, provide your API key:

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';

const client = new MagicButtonClient({
  apiKey: 'your-api-key',
});
```

### Environment Variables

For better security, you should use environment variables to store your API key:

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';

const client = new MagicButtonClient({
  apiKey: process.env.MAGIC_BUTTON_API_KEY,
});
```

Set the environment variable in your development environment or deployment platform.

## API Key Security

Keep your API key secure:

- Never commit API keys to source control
- Use environment variables or a secure secrets manager
- Rotate API keys periodically
- Use the principle of least privilege (create keys with only the permissions they need)

## Custom Authentication

For advanced scenarios, the SDK also supports custom authentication methods:

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

## Next Steps

Now that you've set up authentication:

- [Follow the quick start guide](quick-start)
- [Learn about error handling](/docs/guides/error-handling)
- [Explore the API reference](/docs/api/overview)