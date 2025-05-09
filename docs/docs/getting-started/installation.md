---
sidebar_position: 1
---

# Installation

Installing the Magic Button Cloud SDK is straightforward. This guide will walk you through the installation process and the prerequisites.

## Prerequisites

Before installing the Magic Button Cloud SDK, make sure you have:

- Node.js version 16 or higher
- npm or yarn package manager
- A Magic Button Cloud account with an API key

## Installing the SDK

You can install the SDK using npm:

```bash
npm install @magicbutton/cloud-sdk
```

Or if you prefer yarn:

```bash
yarn add @magicbutton/cloud-sdk
```

## Verifying the Installation

To verify that the SDK is installed correctly, you can create a simple script:

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';

// Should print the version of the SDK
console.log(`Magic Button SDK version: ${MagicButtonClient.VERSION}`);
```

## Next Steps

Now that you have installed the Magic Button Cloud SDK, you can:

- [Set up authentication](authentication)
- [Follow the quick start guide](quick-start)
- [Explore the API reference](/docs/api/overview)