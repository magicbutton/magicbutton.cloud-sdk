---
locked: true
---

**Magic Button Messaging v1.1.1**

***

# Magic Button Messaging

A type-safe, domain-driven design framework for distributed systems communication. Magic Button Messaging provides a robust foundation for building scalable, maintainable, and secure communication between distributed system components.

![Magic Button Messaging](https://via.placeholder.com/800x400?text=Magic+Button+Messaging)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Contracts](#contracts)
  - [Transport Adapters](#transport-adapters)
  - [Client and Server](#client-and-server)
  - [Access Control](#access-control)
  - [Message Context](#message-context)
- [API Reference](#api-reference)
- [Examples](#examples)
  - [Basic Usage](#basic-usage)
  - [Custom Transport](#custom-transport)
  - [Access Control](#access-control-example)
  - [Error Handling](#error-handling)
  - [React Integration](#react-integration)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Contract-First Design**: Define your communication contracts with Zod schemas for complete type safety
- **Dependency Injection**: Inject contracts, transports, and providers for flexible architecture
- **Pluggable Transport Layer**: Use built-in transports or create your own (HTTP, WebSockets, MQTT, etc.)
- **Role-Based Access Control**: Strongly-typed role-based permissions for secure communication
- **Authentication**: Pluggable authentication providers for flexible identity management
- **Authorization**: Fine-grained access control with role inheritance and permissions
- **Type Safety**: Full TypeScript support with inferred types from your Zod schemas
- **Client/Server Architecture**: Dedicated client and server classes for easy implementation
- **Event-Driven Communication**: Support for both request/response and event-based communication patterns
- **Error Handling**: Standardized error registry with severity levels and retry capabilities

<!-- Custom content that should not be overwritten -->
## Installation - Custom Instructions

For this custom installation, please follow these specific steps:

```bash
# First, check your package manager version
npm -v

# Using npm with specific flags
npm install @magicbutton.cloud/messaging --save-exact

# Using yarn with specific flags 
yarn add @magicbutton.cloud/messaging --exact

# Using pnpm with specific flags
pnpm add @magicbutton.cloud/messaging --exact
```

<!-- End of custom content -->

The rest of the docs remain the same as the auto-generated version.