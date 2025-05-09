---
sidebar_position: 2
---

# Transport Adapters

Transport adapters are a fundamental part of Magic Button Messaging that abstract the underlying communication protocol. They enable protocol-agnostic communication between clients and servers, making your code more flexible and adaptable to different environments.

## What are Transport Adapters?

A transport adapter implements the `TransportAdapter` interface and handles the mechanics of:

1. **Connection Management**: Establishing and maintaining connections
2. **Message Serialization**: Converting messages to and from the wire format
3. **Message Routing**: Ensuring messages reach their intended recipients
4. **Event Handling**: Dispatching events to registered handlers
5. **Request Processing**: Handling request/response cycles

By abstracting these details, transport adapters allow you to focus on your application logic rather than communication plumbing.

## The TransportAdapter Interface

All transport adapters implement the `TransportAdapter` interface, which defines the core functionality:

```typescript
interface TransportAdapter<TEvents extends Record<string, any>, TRequests extends Record<string, any>> {
  // Connection Management
  connect(connectionString: string): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConnectionString(): string;
  
  // Event Handling
  emit<E extends string & keyof TEvents>(
    event: E, 
    payload: any, 
    context?: MessageContext
  ): Promise<void>;
  
  on<E extends string & keyof TEvents>(
    event: E, 
    handler: (payload: any, context: MessageContext) => void, 
    subscriptionContext?: MessageContext
  ): void;
  
  off<E extends string & keyof TEvents>(
    event: E, 
    handler: (payload: any, context: MessageContext) => void
  ): void;
  
  // Request Processing
  request<R extends string & keyof TRequests>(
    requestType: R, 
    payload: any, 
    context?: MessageContext
  ): Promise<any>;
  
  handleRequest<R extends string & keyof TRequests>(
    requestType: R, 
    handler: (payload: any, context: MessageContext) => Promise<any>
  ): void;
  
  // Authentication
  login(credentials: any): Promise<AuthResult>;
  logout(): Promise<void>;
}
```

## Built-in Transport Adapters

Magic Button Messaging comes with a built-in `InMemoryTransport` adapter, which is useful for testing and development:

```typescript
import { InMemoryTransport } from "@magicbutton.cloud/messaging";

// Create an in-memory transport
const transport = new InMemoryTransport();
```

The `InMemoryTransport` is ideal for:
- Unit testing without external dependencies
- Local development without setting up infrastructure
- Simple examples and demos
- Learning the library concepts

## Creating Custom Transport Adapters

You can implement your own transport adapters to support different communication protocols. Here's an example of a WebSocket transport adapter:

```typescript
import { TransportAdapter, MessageContext, AuthResult } from "@magicbutton.cloud/messaging";
import WebSocket from "ws";

export class WebSocketTransport<TEvents extends Record<string, any>, TRequests extends Record<string, any>>
  implements TransportAdapter<TEvents, TRequests> {
  
  private socket: WebSocket | null = null;
  private connected = false;
  private connectionString = "";
  private eventHandlers = new Map<string, Set<(payload: any, context: MessageContext) => void>>();
  private pendingRequests = new Map<string, { 
    resolve: (value: any) => void, 
    reject: (reason: any) => void 
  }>();
  
  async connect(connectionString: string): Promise<void> {
    if (this.connected) return;
    
    this.connectionString = connectionString;
    
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(connectionString);
        
        this.socket.onopen = () => {
          this.connected = true;
          resolve();
        };
        
        this.socket.onerror = (error) => {
          reject(new Error(`WebSocket error: ${error.message}`));
        };
        
        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data.toString());
            this.handleMessage(message);
          } catch (error) {
            console.error("Error handling WebSocket message:", error);
          }
        };
        
        this.socket.onclose = () => {
          this.connected = false;
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  
  async disconnect(): Promise<void> {
    if (!this.connected || !this.socket) return;
    
    return new Promise((resolve) => {
      this.socket!.onclose = () => {
        this.connected = false;
        this.socket = null;
        resolve();
      };
      
      this.socket!.close();
    });
  }
  
  isConnected(): boolean {
    return this.connected;
  }
  
  getConnectionString(): string {
    return this.connectionString;
  }
  
  async emit<E extends string & keyof TEvents>(
    event: E, 
    payload: any, 
    context: MessageContext = {}
  ): Promise<void> {
    if (!this.connected || !this.socket) {
      throw new Error("Not connected");
    }
    
    const message = {
      type: "event",
      event,
      payload,
      context,
    };
    
    this.socket.send(JSON.stringify(message));
  }
  
  on<E extends string & keyof TEvents>(
    event: E, 
    handler: (payload: any, context: MessageContext) => void
  ): void {
    if (!this.eventHandlers.has(event as string)) {
      this.eventHandlers.set(event as string, new Set());
    }
    
    this.eventHandlers.get(event as string)!.add(handler);
  }
  
  off<E extends string & keyof TEvents>(
    event: E, 
    handler: (payload: any, context: MessageContext) => void
  ): void {
    const handlers = this.eventHandlers.get(event as string);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event as string);
      }
    }
  }
  
  async request<R extends string & keyof TRequests>(
    requestType: R, 
    payload: any, 
    context: MessageContext = {}
  ): Promise<any> {
    if (!this.connected || !this.socket) {
      throw new Error("Not connected");
    }
    
    const requestId = crypto.randomUUID();
    
    return new Promise((resolve, reject) => {
      // Store the promise resolvers
      this.pendingRequests.set(requestId, { resolve, reject });
      
      // Send the request
      const message = {
        type: "request",
        requestId,
        requestType,
        payload,
        context,
      };
      
      this.socket!.send(JSON.stringify(message));
      
      // Set a timeout for the request
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error(`Request timed out: ${requestType}`));
        }
      }, 30000); // 30 second timeout
    });
  }
  
  handleRequest<R extends string & keyof TRequests>(
    requestType: R, 
    handler: (payload: any, context: MessageContext) => Promise<any>
  ): void {
    // Register a handler for this request type
    this.on(`$request:${requestType}` as any, async (request, context) => {
      try {
        const result = await handler(request.payload, context);
        
        // Send response
        const response = {
          type: "response",
          requestId: request.requestId,
          success: true,
          data: result,
          context,
        };
        
        this.socket!.send(JSON.stringify(response));
      } catch (error) {
        // Send error response
        const response = {
          type: "response",
          requestId: request.requestId,
          success: false,
          error: {
            code: error.code || "UNKNOWN_ERROR",
            message: error.message || "Unknown error",
            details: error.details,
          },
          context,
        };
        
        this.socket!.send(JSON.stringify(response));
      }
    });
  }
  
  private handleMessage(message: any): void {
    if (message.type === "event") {
      // Handle incoming event
      const handlers = this.eventHandlers.get(message.event);
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(message.payload, message.context || {});
          } catch (error) {
            console.error(`Error in event handler for ${message.event}:`, error);
          }
        }
      }
    } else if (message.type === "request") {
      // Handle incoming request
      const handlers = this.eventHandlers.get(`$request:${message.requestType}`);
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(message, message.context || {});
          } catch (error) {
            console.error(`Error in request handler for ${message.requestType}:`, error);
          }
        }
      }
    } else if (message.type === "response") {
      // Handle incoming response
      const pendingRequest = this.pendingRequests.get(message.requestId);
      if (pendingRequest) {
        this.pendingRequests.delete(message.requestId);
        
        if (message.success) {
          pendingRequest.resolve(message.data);
        } else {
          const error = new Error(message.error.message);
          error.code = message.error.code;
          error.details = message.error.details;
          pendingRequest.reject(error);
        }
      }
    }
  }
  
  async login(credentials: any): Promise<AuthResult> {
    return this.request("$login" as any, credentials);
  }
  
  async logout(): Promise<void> {
    return this.request("$logout" as any, {});
  }
}
```

## Other Transport Adapter Examples

Here are examples of other transport adapters you might implement:

### HTTP Transport

```typescript
// Using the built-in fetch API for HTTP requests
export class HttpTransport implements TransportAdapter {
  // Implementation details...
  
  async request(requestType, payload, context) {
    const response = await fetch(`${this.baseUrl}/api/${requestType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth headers from context if available
        ...(context.auth?.token ? { 'Authorization': `Bearer ${context.auth.token}` } : {})
      },
      body: JSON.stringify({ payload, context }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.error?.message || 'Request failed');
      error.code = data.error?.code;
      error.details = data.error?.details;
      throw error;
    }
    
    return data.result;
  }
  
  // For events, use server-sent events or long polling
  // ...
}
```

### MQTT Transport

```typescript
import * as mqtt from 'mqtt';

export class MqttTransport implements TransportAdapter {
  private client: mqtt.Client | null = null;
  
  async connect(connectionString) {
    this.client = mqtt.connect(connectionString);
    
    return new Promise((resolve, reject) => {
      this.client!.on('connect', () => {
        resolve();
      });
      
      this.client!.on('error', (error) => {
        reject(error);
      });
    });
  }
  
  async emit(event, payload, context) {
    const topic = `events/${event}`;
    this.client!.publish(topic, JSON.stringify({ payload, context }));
  }
  
  on(event, handler) {
    const topic = `events/${event}`;
    
    this.client!.subscribe(topic);
    this.client!.on('message', (receivedTopic, message) => {
      if (receivedTopic === topic) {
        const { payload, context } = JSON.parse(message.toString());
        handler(payload, context);
      }
    });
  }
  
  // Implementation for requests using request/response topics
  // ...
}
```

## Transport Selection Strategy

When choosing or implementing a transport adapter, consider:

1. **Protocol Requirements**: Does your system need HTTP, WebSockets, MQTT, etc.?
2. **Performance Characteristics**: What are the latency and throughput requirements?
3. **Reliability Needs**: Is guaranteed delivery required?
4. **Scalability Concerns**: How many clients/servers will be communicating?
5. **Security Requirements**: What authentication and encryption are needed?

You can even use different transports for different parts of your system:

```typescript
// For server-to-server communication
const serverTransport = new GrpcTransport();
const server = new Server(serverTransport);

// For browser clients
const browserTransport = new WebSocketTransport();
const browserServer = new Server(browserTransport);
```

## Next Steps

Now that you understand transport adapters, explore these related topics:

- [Client and Server](client-server): Learn how to use clients and servers with transport adapters
- [Message Context](message-context): Understand how to pass metadata with messages
- [Middleware](../features/middleware): Add middleware to customize transport behavior