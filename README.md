# Magic Button Cloud SDK

The official JavaScript/TypeScript SDK for the Magic Button Cloud API.

## Features

- Complete TypeScript support with full type definitions
- Modern, Promise-based API
- Comprehensive error handling
- Built-in retry logic for transient failures
- Detailed documentation with examples

## Installation

```bash
npm install @magicbutton/cloud-sdk
# or
yarn add @magicbutton/cloud-sdk
```

## Quick Start

```typescript
import { MagicButtonClient } from '@magicbutton/cloud-sdk';

// Initialize the client
const client = new MagicButtonClient({
  apiKey: 'your-api-key',
});

// Use the client
async function example() {
  try {
    const result = await client.someOperation({
      // parameters
    });
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Documentation

The documentation for this SDK is built with [Docusaurus](https://docusaurus.io/) and can be found in the `docs/` directory.

### Running the documentation locally

```bash
# Option 1: From the repository root
npm run docs:start

# Option 2: From the docs directory
cd docs
npm start
```

This will start a local development server at http://localhost:3000.

### Building the documentation

```bash
# Option 1: From the repository root
npm run docs:build

# Option 2: From the docs directory
cd docs
npm run build
```

For more details about the documentation, see [DOCUMENTATION.md](DOCUMENTATION.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.