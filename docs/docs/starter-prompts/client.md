---
sidebar_position: 1
locked: true
---

# Client Starter Prompt

## Create a Messaging UI Client

```prompt
Create a React-based messaging UI client that connects to my Magic Button Cloud messaging server. The client should:

1. Use the @magicbutton.cloud/messaging library to connect to the server
2. Implement a clean, minimal UI for sending and receiving messages
3. Handle authentication and maintain connection state
4. Support both request/response and event-based communication
5. Include error handling and reconnection logic
6. Follow modern React patterns (hooks, functional components)
7. Mock the server using InMemoryTransport for development and testing

Please consider responsive design and accessibility best practices.

Here are some specific implementation patterns to follow:

// Contract definition
import * as z from "zod";
import { createContract, createEventMap, createRequestSchemaMap } from "@magicbutton.cloud/messaging";

const events = createEventMap({
  messageReceived: z.object({
    id: z.string(),
    text: z.string(),
    sender: z.string(),
    timestamp: z.number()
  })
});

const requests = createRequestSchemaMap({
  sendMessage: {
    requestSchema: z.object({
      text: z.string(),
      recipient: z.string()
    }),
    responseSchema: z.object({
      success: z.boolean(),
      messageId: z.string().optional()
    })
  }
});

// Client implementation
function useMessagingClient() {
  // Use InMemoryTransport to mock the server for development and testing
  const transport = new InMemoryTransport();
  const client = new Client(transport, {
    clientId: "web-client",
    autoReconnect: true
  });

  // Connection and event handling logic...
}
```

## Ready to build your custom messaging client?

[Get started with Magic Button Cloud Client →](/docs/messaging/quick-start)