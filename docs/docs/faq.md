---
sidebar_position: 4
---

# Frequently Asked Questions

This page answers common questions about the Magic Button Cloud SDK.

## General Questions

### What is the Magic Button Cloud SDK?

The Magic Button Cloud SDK is a client library that allows you to interact with the Magic Button Cloud API from your JavaScript or TypeScript applications.

### What platforms are supported?

The SDK supports any JavaScript environment, including:
- Node.js (version 16 or higher)
- Modern browsers
- React Native
- Electron

### Is the SDK open source?

Yes, the Magic Button Cloud SDK is open source. You can find the source code on [GitHub](https://github.com/magicbutton/magicbutton.cloud-sdk).

## Installation & Setup

### How do I install the SDK?

You can install the SDK using npm or yarn:

```bash
npm install @magicbutton/cloud-sdk
# or
yarn add @magicbutton/cloud-sdk
```

### Where do I get an API key?

You can get an API key from the Magic Button Cloud dashboard. Log in to your account at [https://dashboard.magicbutton.cloud](https://dashboard.magicbutton.cloud) and navigate to the API Keys section.

### Can I use the SDK in a browser?

Yes, the SDK works in both Node.js and browser environments. When used in a browser, you should ensure that your API key is secured properly.

## Usage Questions

### How do I handle errors?

The SDK provides structured error handling with specific error types. See the [Error Handling Guide](/docs/guides/error-handling) for details.

```typescript
try {
  const result = await client.someOperation({
    // parameters
  });
} catch (error) {
  if (error instanceof MagicButtonError) {
    console.error('API Error:', error.message);
  }
}
```

### How do I use pagination?

For paginated endpoints, you can use the cursor-based pagination:

```typescript
// Get the first page
const firstPage = await client.listItems({ limit: 10 });

// Get the next page using the cursor
if (firstPage.hasMore) {
  const nextPage = await client.listItems({
    limit: 10,
    cursor: firstPage.nextCursor,
  });
}
```

### Are there rate limits?

Yes, the Magic Button Cloud API has rate limits. The specific limits depend on your account plan. The SDK automatically handles rate limit responses and provides information about them in the error objects.

## Troubleshooting

### Why am I getting authentication errors?

Common reasons for authentication errors:
- Invalid API key
- Expired API key
- API key doesn't have permission for the operation
- Using the wrong environment (test vs. production)

### How do I debug SDK issues?

You can enable debug mode to see detailed logs:

```typescript
const client = new MagicButtonClient({
  apiKey: 'your-api-key',
  debug: true, // Enable debug logging
});
```

### Where can I get help?

If you encounter any issues:
- Check the [documentation](/)
- Open an issue on [GitHub](https://github.com/magicbutton/magicbutton.cloud-sdk/issues)
- Contact support at support@magicbutton.cloud