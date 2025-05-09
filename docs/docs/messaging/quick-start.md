---
sidebar_position: 3
---

# Quick Start

This guide will help you get started with Magic Button Messaging by walking through a simple example. We'll create a basic client-server application using the in-memory transport.

## Setting Up Your Project

First, make sure you have [installed Magic Button Messaging](installation). Then, create a new TypeScript file for our example:

## Defining a Contract

The first step is to define a contract that specifies the events and requests our services will use:

```typescript
import * as z from "zod";
import { 
  createContract, 
  createEventMap, 
  createRequestSchemaMap 
} from "@magicbutton.cloud/messaging";

// Define event schemas
const events = createEventMap({
  // An event emitted when a user is created
  userCreated: z.object({
    id: z.string(),
    email: z.string().email(),
    createdAt: z.number(),
  }),
  
  // An event emitted when a user is updated
  userUpdated: z.object({
    id: z.string(),
    email: z.string().email().optional(),
    name: z.string().optional(),
    updatedAt: z.number(),
  }),
});

// Define request/response schemas
const requests = createRequestSchemaMap({
  // A request to get a user by ID
  getUserById: {
    requestSchema: z.object({
      id: z.string(),
    }),
    responseSchema: z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string().nullable(),
      createdAt: z.number(),
    }),
  },
  
  // A request to create a new user
  createUser: {
    requestSchema: z.object({
      email: z.string().email(),
      name: z.string().optional(),
    }),
    responseSchema: z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string().nullable(),
      createdAt: z.number(),
    }),
  },
});

// Define error codes
const errors = {
  USER_NOT_FOUND: { code: "USER_NOT_FOUND", message: "User not found", status: 404 },
  INVALID_EMAIL: { code: "INVALID_EMAIL", message: "Invalid email format", status: 400 },
};

// Create the contract
const userServiceContract = createContract({
  events,
  requests,
  errors,
});

// Export the contract type for type safety
export type UserServiceContract = typeof userServiceContract;
export { userServiceContract };
```

## Implementing the Server

Now, let's implement a server that handles the requests defined in our contract:

```typescript
import { Server, InMemoryTransport } from "@magicbutton.cloud/messaging";
import { userServiceContract } from "./contract";

// Simulated user database
const users = new Map();

async function startServer() {
  // Create a server with the in-memory transport
  const transport = new InMemoryTransport();
  const server = new Server(transport);

  // Start the server
  await server.start("memory://user-service");

  // Handle the getUserById request
  server.handleRequest("getUserById", async (payload, context, clientId) => {
    const { id } = payload;
    
    // Look up the user in our "database"
    const user = users.get(id);
    
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    
    return user;
  });

  // Handle the createUser request
  server.handleRequest("createUser", async (payload, context, clientId) => {
    const { email, name } = payload;
    
    // Create a new user
    const user = {
      id: crypto.randomUUID(),
      email,
      name: name || null,
      createdAt: Date.now(),
    };
    
    // Save the user
    users.set(user.id, user);
    
    // Emit userCreated event
    await server.broadcast("userCreated", {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });
    
    return user;
  });

  console.log("User service running on memory://user-service");
  return server;
}
```

## Implementing the Client

Next, let's implement a client that connects to our server and makes requests:

```typescript
import { Client, InMemoryTransport, createMessageContext } from "@magicbutton.cloud/messaging";
import { userServiceContract } from "./contract";

async function startClient() {
  // Create a client with the in-memory transport
  const transport = new InMemoryTransport();
  const client = new Client(transport, {
    clientId: "admin-client",
    clientType: "admin",
  });

  // Connect to the server
  await client.connect("memory://user-service");

  // Subscribe to events
  client.on("userCreated", (payload) => {
    console.log("New user created:", payload);
  });

  console.log("Client connected to user service");
  return client;
}
```

## Putting It All Together

Now, let's put everything together and run our example:

```typescript
async function runExample() {
  // Start the server
  const server = await startServer();
  
  // Start the client
  const client = await startClient();
  
  try {
    // Create a user
    console.log("Creating a user...");
    const newUser = await client.request("createUser", {
      email: "john@example.com",
      name: "John Doe",
    });
    console.log("User created:", newUser);
    
    // Get the user by ID
    console.log("Getting user by ID...");
    const user = await client.request("getUserById", { id: newUser.id });
    console.log("Retrieved user:", user);
    
    // Try to get a non-existent user
    console.log("Trying to get a non-existent user...");
    try {
      await client.request("getUserById", { id: "non-existent-id" });
    } catch (error) {
      console.error("Error retrieving user:", error.message);
    }
  } finally {
    // Clean up
    await client.disconnect();
    await server.stop();
  }
}

runExample().catch(console.error);
```

## Running the Example

Save the code above in separate files or in a single file, and run it with Node.js:

```bash
npx ts-node example.ts
```

You should see output similar to this:

```
User service running on memory://user-service
Client connected to user service
Creating a user...
User created: {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'john@example.com',
  name: 'John Doe',
  createdAt: 1652345678901
}
New user created: {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'john@example.com',
  createdAt: 1652345678901
}
Getting user by ID...
Retrieved user: {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'john@example.com',
  name: 'John Doe',
  createdAt: 1652345678901
}
Trying to get a non-existent user...
Error retrieving user: USER_NOT_FOUND
```

## Next Steps

Congratulations! You've created a simple application using Magic Button Messaging. Here are some next steps to explore:

- Learn about [Contracts](core-concepts/contracts) in depth
- Explore [Transport Adapters](core-concepts/transport) to use different communication protocols
- Implement [Access Control](features/access-control) for secure communication
- Add [Middleware](features/middleware) for validation, logging, and more
- Understand [Error Handling](features/error-handling) patterns