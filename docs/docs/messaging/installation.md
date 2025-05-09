---
sidebar_position: 2
---

# Installation

Getting started with Magic Button Messaging is straightforward. This guide will walk you through the installation process and help you set up your project to use the library.

## Prerequisites

Before installing Magic Button Messaging, make sure you have:

- Node.js (version 14 or higher)
- npm, yarn, or pnpm

## Installation Steps

You can install Magic Button Messaging using your preferred package manager:

### Using npm

```bash
npm install @magicbutton.cloud/messaging
```

### Using yarn

```bash
yarn add @magicbutton.cloud/messaging
```

### Using pnpm

```bash
pnpm add @magicbutton.cloud/messaging
```

## Dependencies

Magic Button Messaging uses the following dependencies, which will be installed automatically:

- **zod**: For schema validation and type safety
- **uuid**: For generating unique identifiers

## TypeScript Configuration

Magic Button Messaging is built with TypeScript and provides full type safety. We recommend the following TypeScript configuration in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

## Verifying Installation

After installing Magic Button Messaging, you can verify the installation by creating a simple test script:

```typescript
// test.ts
import { createContract, createEventMap, createRequestSchemaMap } from "@magicbutton.cloud/messaging";
import * as z from "zod";

// If this code runs without errors, the installation was successful
const testContract = createContract({
  events: createEventMap({
    testEvent: z.object({ message: z.string() })
  }),
  requests: createRequestSchemaMap({
    testRequest: {
      requestSchema: z.object({ input: z.string() }),
      responseSchema: z.object({ output: z.string() })
    }
  })
});

console.log("Magic Button Messaging is installed correctly!");
```

Run this script with TypeScript:

```bash
npx ts-node test.ts
```

If you see "Magic Button Messaging is installed correctly!" in the output, then the installation was successful.

## Next Steps

Now that you have Magic Button Messaging installed, you can proceed to the [Quick Start](quick-start) guide to learn how to use it in your application.