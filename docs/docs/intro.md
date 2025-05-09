---
sidebar_position: 1
---

# Magic Button SDK

Welcome to the **Magic Button Cloud SDK** documentation. This SDK provides a powerful, yet simple interface to interact with the Magic Button Cloud API.

## Overview

Magic Button is a cloud platform that allows you to create, manage, and deploy your AI applications with ease. The Magic Button Cloud SDK provides a seamless way to integrate your applications with the Magic Button platform.

## Key Features

- **Simple Integration**: Easy-to-use API for quick implementation
- **Comprehensive Coverage**: Access to all Magic Button Cloud features
- **Type Safety**: Full TypeScript support with complete type definitions
- **Error Handling**: Robust error handling and detailed error messages
- **Performance**: Optimized for high performance and reliability

## Installation

Installing the SDK is simple:

```bash
npm install @magicbutton/cloud-sdk
```

or with yarn:

```bash
yarn add @magicbutton/cloud-sdk
```

## Quick Example

Here's a quick example of how to use the SDK:

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';

// Initialize the client
const client = new MagicButtonClient({
  apiKey: 'your-api-key',
});

// Make API calls
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

## Next Steps

- [Installation](getting-started/installation): Detailed installation instructions
- [Quick Start](getting-started/quick-start): Get up and running quickly
- [API Reference](api/overview): Explore the full API documentation
