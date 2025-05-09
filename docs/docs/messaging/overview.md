---
sidebar_position: 1
---

# Magic Button Messaging

Magic Button Messaging is a type-safe, domain-driven design framework for distributed systems communication. It provides a robust foundation for building scalable, maintainable, and secure communication between distributed system components.

![Magic Button Messaging](https://via.placeholder.com/800x400?text=Magic+Button+Messaging)

## Features

- **Contract-First Design**: Define your communication contracts with Zod schemas for complete type safety
- **Pluggable Transport Layer**: Use built-in transports or create your own (HTTP, WebSockets, MQTT, etc.)
- **Middleware Pipeline**: Insert middleware for logging, authentication, validation, and more
- **Access Control**: Built-in role-based access control for secure communication
- **Type Safety**: Full TypeScript support with inferred types from your Zod schemas
- **Client/Server Architecture**: Dedicated client and server classes for easy implementation
- **Event-Driven Communication**: Support for both request/response and event-based communication patterns
- **Context Propagation**: Pass context information (auth, tracing, etc.) through your communication chain

## Why Magic Button Messaging?

### Problem

Distributed systems face common challenges:

- **Type safety** across service boundaries
- **Validation** of incoming and outgoing messages
- **Authentication and authorization** for service-to-service communication
- **Observability** across the entire communication chain
- **Error handling** that preserves context and supports automatic retries
- **Protocol independence** to support different transport mechanisms

### Solution

Magic Button Messaging addresses these challenges with a comprehensive framework that provides:

- **End-to-end type safety** using TypeScript and Zod schemas
- **Protocol agnostic** communication with pluggable transports
- **Built-in middleware** for common concerns like validation, authentication, and logging
- **Flexible error handling** with retries and circuit breaking
- **Comprehensive observability** including logging, metrics, and tracing
- **Role-based access control** for fine-grained security policies

## Core Concepts

Magic Button Messaging is built around a few key concepts:

### Contracts

Contracts define the shape of your communication. They consist of:

- **Events**: One-way messages published by services
- **Requests**: Request/response pairs for service-to-service communication
- **Errors**: Standardized error codes and messages

### Transport Adapters

Transport adapters abstract the underlying communication protocol. Magic Button Messaging comes with an `InMemoryTransport` for testing, but you can implement your own adapters for HTTP, WebSockets, MQTT, etc.

### Client and Server

The `Client` and `Server` classes provide high-level abstractions for communication:

- **Server**: Handles requests and publishes events
- **Client**: Sends requests and subscribes to events

### Message Context

Message context allows you to pass metadata with your messages, such as authentication information, tracing IDs, and more.

### Access Control

The built-in role-based access control system allows you to secure your communication with fine-grained permissions.

## Quick Example

```typescript
import * as z from "zod";
import { 
  createContract, 
  createEventMap, 
  createRequestSchemaMap, 
  InMemoryTransport, 
  Client, 
  Server 
} from "@magicbutton.cloud/messaging";

// Define contract
const contract = createContract({
  events: createEventMap({
    greeting: z.object({ message: z.string() }),
  }),
  requests: createRequestSchemaMap({
    sayHello: {
      requestSchema: z.object({ name: z.string() }),
      responseSchema: z.object({ greeting: z.string() }),
    },
  }),
});

// Set up server
const serverTransport = new InMemoryTransport();
const server = new Server(serverTransport);
await server.start("memory://hello-service");

server.handleRequest("sayHello", async (payload) => {
  return { greeting: `Hello, ${payload.name}!` };
});

// Set up client
const clientTransport = new InMemoryTransport();
const client = new Client(clientTransport);
await client.connect("memory://hello-service");

// Send request
const response = await client.request("sayHello", { name: "World" });
console.log(response.greeting); // "Hello, World!"
```

## Next Steps

- [Installation](installation): Install Magic Button Messaging in your project
- [Quick Start](quick-start): Get started with a simple example
- [Core Concepts](core-concepts/contracts): Learn about the key concepts in Magic Button Messaging
- [Access Control](features/access-control): Secure your communication with fine-grained permissions
- [Middleware](features/middleware): Extend the functionality with middleware
- [Error Handling](features/error-handling): Handle errors gracefully