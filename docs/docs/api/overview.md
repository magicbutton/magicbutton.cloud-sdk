---
sidebar_position: 1
---

# API Reference Overview

This section provides detailed documentation for the Magic Button Cloud SDK API. The API reference is organized by functionality to help you find what you need quickly.

## Core Concepts

The Magic Button Cloud SDK is built around a few key concepts:

- **Client**: The main entry point for interacting with the API
- **Operations**: Methods to perform specific actions on the API
- **Models**: TypeScript interfaces that define the structure of data
- **Responses**: Standardized return types for API calls
- **Errors**: Structured error handling

## Client

The `MagicButtonClient` is the main class you'll interact with. It provides methods for all available API operations and handles authentication, request formatting, and response parsing.

See the [Client documentation](client) for details on client configuration and usage.

## Operations

Operations are methods on the client that correspond to specific API endpoints. Each operation has its own set of parameters and return types.

See the [Operations documentation](operations) for a complete list of available operations.

## Models

The SDK uses TypeScript interfaces to define the structure of request and response data. These models provide type safety and auto-completion in TypeScript projects.

See the following sections for details:
- [Common Models](models/common): Shared models used across multiple operations
- [Request Models](models/requests): Models for request parameters
- [Error Models](models/errors): Models for API errors

## Error Handling

The SDK provides structured error handling with specific error types for different error scenarios. This makes it easier to handle errors in your application.

See the [Error Handling Guide](/docs/guides/error-handling) for more information on handling errors.

## Example

Here's a quick example of using the API:

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';

// Initialize the client
const client = new MagicButtonClient({
  apiKey: 'your-api-key',
});

// Use an operation
async function example() {
  try {
    const result = await client.someOperation({
      // parameters
    });
    console.log('Operation successful:', result);
  } catch (error) {
    console.error('Operation failed:', error);
  }
}
```