---
sidebar_position: 2
locked: true
---

# Server Starter Prompt

## Create a Messaging Server

```prompt
Create a Node.js messaging server using the Magic Button Cloud messaging framework. The server should:

1. Use the @magicbutton.cloud/messaging library to handle incoming connections
2. Define a clear contract with Zod schemas for requests, responses, and events
3. Implement role-based access control for secure communication
4. Include proper error handling with standardized error codes
5. Provide observability through logging and metrics
6. Support horizontal scaling for high availability
7. Mock client connections for testing and development

Please include examples of handling different message types and implementing middleware.

Here are some specific implementation patterns to follow:

// Contract definition
import * as z from "zod";
import { createContract, createEventMap, createRequestSchemaMap, createErrorMap } from "@magicbutton.cloud/messaging";

const events = createEventMap({
  serverStatus: z.object({
    status: z.enum(["healthy", "degraded", "unhealthy"]),
    connections: z.number(),
    uptime: z.number()
  })
});

const requests = createRequestSchemaMap({
  registerClient: {
    requestSchema: z.object({
      clientId: z.string(),
      clientType: z.string(),
      capabilities: z.array(z.string())
    }),
    responseSchema: z.object({
      success: z.boolean(),
      sessionId: z.string().optional(),
      error: z.string().optional()
    })
  }
});

const errors = createErrorMap({
  CLIENT_EXISTS: { code: "CLIENT_EXISTS", message: "Client ID already registered", status: 409 },
  INVALID_CLIENT: { code: "INVALID_CLIENT", message: "Invalid client configuration", status: 400 }
});

// Server implementation with mocked clients
const transport = new InMemoryTransport();
const server = new Server(transport);

// Start the server
await server.start("memory://message-service");

// Create mock clients for testing
function createMockClient(clientId, clientType) {
  const clientTransport = new InMemoryTransport();
  const client = new Client(clientTransport, { clientId, clientType });
  await client.connect("memory://message-service");
  return client;
}

// Test with a mock client
const mockClient = createMockClient("test-client", "user");
```

## Ready to build your custom messaging server?

[Get started with Magic Button Cloud Server →](/docs/messaging/quick-start)