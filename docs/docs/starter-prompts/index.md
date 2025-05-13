---
sidebar_position: 0
slug: /starter-prompts
locked: true
---

# Starter Prompts

Use these prompts with your favorite AI assistant to quickly scaffold Magic Button Cloud applications. These prompts will help you get a head start on building both client and server components of your messaging architecture.

## Available Prompts

- [**Client**](/docs/starter-prompts/client) - Create a messaging UI client that connects to Magic Button Cloud
- [**Server**](/docs/starter-prompts/server) - Build a messaging server using the Magic Button Cloud framework

## How to Use

1. Copy the prompt text from the desired starter
2. Paste it into your AI assistant of choice (Claude, ChatGPT, etc.)
3. Customize the prompt with your specific requirements if needed
4. Run the prompt to get a complete starter implementation

All generated code will use the Magic Button Cloud messaging framework, ensuring a consistent architecture and full compatibility between your client and server components.

## Testing with Mocks

Both starter prompts include instructions for mocking the other side of the communication:

- **Client Prompt**: Includes code to mock the server using `InMemoryTransport`
- **Server Prompt**: Shows how to create mock clients for testing

This approach allows you to develop and test either component independently before connecting them together, greatly simplifying the development process.

## Customizing Your Implementation

The generated code provides a foundation that you can further customize by:

1. Adding your own contract definitions for your specific domain
2. Implementing custom authorization logic
3. Extending the transport layer for your specific needs
4. Adding middleware for cross-cutting concerns
5. Integrating with your existing systems

For more detailed guidance, refer to the framework documentation in the [Messaging](/docs/messaging/overview) section.