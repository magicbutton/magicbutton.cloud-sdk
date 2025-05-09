---
sidebar_position: 10
---

# Advanced Usage Examples

This page provides advanced examples of Magic Button Messaging to help you understand how to use the library in real-world scenarios.

## Microservices Communication

This example demonstrates how to use Magic Button Messaging for communication between microservices.

### Shared Contract

First, define a shared contract for the order service:

```typescript
// contracts/order-service.ts
import * as z from "zod";
import { createContract, createEventMap, createRequestSchemaMap, createErrorMap } from "@magicbutton.cloud/messaging";

// Define order status enum
const OrderStatus = z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]);
type OrderStatus = z.infer<typeof OrderStatus>;

// Define order item schema
const OrderItem = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});
type OrderItem = z.infer<typeof OrderItem>;

// Define full order schema
const Order = z.object({
  id: z.string(),
  customerId: z.string(),
  items: z.array(OrderItem),
  status: OrderStatus,
  totalAmount: z.number(),
  shippingAddress: z.object({
    name: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  createdAt: z.number(),
  updatedAt: z.number(),
});
type Order = z.infer<typeof Order>;

// Define events
const events = createEventMap({
  orderCreated: z.object({
    orderId: z.string(),
    customerId: z.string(),
    totalAmount: z.number(),
    timestamp: z.number(),
  }),
  
  orderStatusChanged: z.object({
    orderId: z.string(),
    previousStatus: OrderStatus,
    newStatus: OrderStatus,
    timestamp: z.number(),
  }),
  
  orderShipped: z.object({
    orderId: z.string(),
    trackingNumber: z.string(),
    carrier: z.string(),
    estimatedDelivery: z.number(),
    timestamp: z.number(),
  }),
});

// Define requests
const requests = createRequestSchemaMap({
  createOrder: {
    requestSchema: z.object({
      customerId: z.string(),
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number(),
      })),
      shippingAddress: z.object({
        name: z.string(),
        street: z.string(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string(),
      }),
    }),
    responseSchema: Order,
  },
  
  getOrderById: {
    requestSchema: z.object({
      orderId: z.string(),
    }),
    responseSchema: Order,
  },
  
  updateOrderStatus: {
    requestSchema: z.object({
      orderId: z.string(),
      status: OrderStatus,
    }),
    responseSchema: Order,
  },
  
  cancelOrder: {
    requestSchema: z.object({
      orderId: z.string(),
      reason: z.string().optional(),
    }),
    responseSchema: Order,
  },
});

// Define errors
const errors = createErrorMap({
  ORDER_NOT_FOUND: {
    code: "ORDER_NOT_FOUND",
    message: "Order with ID {orderId} not found",
    status: 404,
  },
  
  INVALID_ORDER_STATUS_TRANSITION: {
    code: "INVALID_ORDER_STATUS_TRANSITION",
    message: "Cannot transition order from {currentStatus} to {requestedStatus}",
    status: 400,
  },
  
  PRODUCT_NOT_AVAILABLE: {
    code: "PRODUCT_NOT_AVAILABLE",
    message: "Product {productId} is not available in requested quantity {requestedQuantity}",
    status: 400,
  },
  
  ORDER_ALREADY_CANCELLED: {
    code: "ORDER_ALREADY_CANCELLED",
    message: "Order with ID {orderId} is already cancelled",
    status: 400,
  },
});

// Create the contract
export const orderServiceContract = createContract({
  events,
  requests,
  errors,
});

export type OrderServiceContract = typeof orderServiceContract;
```

### Order Service Implementation

Next, implement the order service:

```typescript
// order-service.ts
import { Server, InMemoryTransport, createMessageContext } from "@magicbutton.cloud/messaging";
import { orderServiceContract } from "./contracts/order-service";

// Mock product service client
import { productServiceClient } from "./product-service-client";

// Mock database
const orders = new Map();

// Create server
const transport = new InMemoryTransport();
const server = new Server(transport);

async function startOrderService() {
  // Start the server
  await server.start("memory://order-service");
  console.log("Order service started");
  
  // Handle createOrder request
  server.handleRequest("createOrder", async (payload, context, clientId) => {
    console.log(`Received createOrder request from ${clientId}`);
    
    // Verify product availability
    for (const item of payload.items) {
      const product = await productServiceClient.request("getProductById", {
        productId: item.productId,
      }, context);
      
      if (product.stock < item.quantity) {
        throw orderServiceContract.errors.PRODUCT_NOT_AVAILABLE({
          params: {
            productId: item.productId,
            requestedQuantity: String(item.quantity),
          },
        });
      }
    }
    
    // Fetch product details
    const itemsWithDetails = await Promise.all(
      payload.items.map(async (item) => {
        const product = await productServiceClient.request("getProductById", {
          productId: item.productId,
        }, context);
        
        return {
          productId: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        };
      })
    );
    
    // Calculate total amount
    const totalAmount = itemsWithDetails.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    // Create the order
    const now = Date.now();
    const order = {
      id: `order-${now}`,
      customerId: payload.customerId,
      items: itemsWithDetails,
      status: "pending",
      totalAmount,
      shippingAddress: payload.shippingAddress,
      createdAt: now,
      updatedAt: now,
    };
    
    // Save to database
    orders.set(order.id, order);
    
    // Reserve products
    await Promise.all(
      payload.items.map(async (item) => {
        await productServiceClient.request("reserveProduct", {
          productId: item.productId,
          quantity: item.quantity,
          orderId: order.id,
        }, context);
      })
    );
    
    // Emit orderCreated event
    await server.broadcast("orderCreated", {
      orderId: order.id,
      customerId: order.customerId,
      totalAmount: order.totalAmount,
      timestamp: now,
    });
    
    return order;
  });
  
  // Handle getOrderById request
  server.handleRequest("getOrderById", async (payload, context, clientId) => {
    console.log(`Received getOrderById request from ${clientId}`);
    
    const order = orders.get(payload.orderId);
    
    if (!order) {
      throw orderServiceContract.errors.ORDER_NOT_FOUND({
        params: { orderId: payload.orderId },
      });
    }
    
    return order;
  });
  
  // Handle updateOrderStatus request
  server.handleRequest("updateOrderStatus", async (payload, context, clientId) => {
    console.log(`Received updateOrderStatus request from ${clientId}`);
    
    const order = orders.get(payload.orderId);
    
    if (!order) {
      throw orderServiceContract.errors.ORDER_NOT_FOUND({
        params: { orderId: payload.orderId },
      });
    }
    
    // Validate status transition
    const validTransitions = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };
    
    if (!validTransitions[order.status].includes(payload.status)) {
      throw orderServiceContract.errors.INVALID_ORDER_STATUS_TRANSITION({
        params: {
          currentStatus: order.status,
          requestedStatus: payload.status,
        },
      });
    }
    
    // Update the order
    const previousStatus = order.status;
    order.status = payload.status;
    order.updatedAt = Date.now();
    
    // Emit orderStatusChanged event
    await server.broadcast("orderStatusChanged", {
      orderId: order.id,
      previousStatus,
      newStatus: order.status,
      timestamp: order.updatedAt,
    });
    
    // If order is shipped, emit orderShipped event
    if (payload.status === "shipped" && payload.trackingInfo) {
      await server.broadcast("orderShipped", {
        orderId: order.id,
        trackingNumber: payload.trackingInfo.trackingNumber,
        carrier: payload.trackingInfo.carrier,
        estimatedDelivery: payload.trackingInfo.estimatedDelivery,
        timestamp: order.updatedAt,
      });
    }
    
    return order;
  });
  
  // Handle cancelOrder request
  server.handleRequest("cancelOrder", async (payload, context, clientId) => {
    console.log(`Received cancelOrder request from ${clientId}`);
    
    const order = orders.get(payload.orderId);
    
    if (!order) {
      throw orderServiceContract.errors.ORDER_NOT_FOUND({
        params: { orderId: payload.orderId },
      });
    }
    
    if (order.status === "cancelled") {
      throw orderServiceContract.errors.ORDER_ALREADY_CANCELLED({
        params: { orderId: payload.orderId },
      });
    }
    
    if (!["pending", "processing"].includes(order.status)) {
      throw orderServiceContract.errors.INVALID_ORDER_STATUS_TRANSITION({
        params: {
          currentStatus: order.status,
          requestedStatus: "cancelled",
        },
      });
    }
    
    // Update the order
    const previousStatus = order.status;
    order.status = "cancelled";
    order.cancellationReason = payload.reason || "Cancelled by user";
    order.updatedAt = Date.now();
    
    // Release reserved products
    await Promise.all(
      order.items.map(async (item) => {
        await productServiceClient.request("releaseProduct", {
          productId: item.productId,
          quantity: item.quantity,
          orderId: order.id,
        }, context);
      })
    );
    
    // Emit orderStatusChanged event
    await server.broadcast("orderStatusChanged", {
      orderId: order.id,
      previousStatus,
      newStatus: order.status,
      timestamp: order.updatedAt,
    });
    
    return order;
  });
}

startOrderService().catch(console.error);
```

### Notification Service

Next, implement a notification service that listens for order events:

```typescript
// notification-service.ts
import { Client, InMemoryTransport, createMessageContext } from "@magicbutton.cloud/messaging";
import { orderServiceContract } from "./contracts/order-service";

// Mock email service
const emailService = {
  sendOrderConfirmation: async (customerId, order) => {
    console.log(`Sending order confirmation email to customer ${customerId} for order ${order.orderId}`);
    // In a real implementation, this would send an actual email
  },
  
  sendOrderStatusUpdate: async (customerId, order, newStatus) => {
    console.log(`Sending status update email to customer ${customerId}: Order ${order.orderId} is now ${newStatus}`);
    // In a real implementation, this would send an actual email
  },
  
  sendShippingNotification: async (customerId, order, trackingInfo) => {
    console.log(`Sending shipping notification to customer ${customerId} for order ${order.orderId}`);
    console.log(`Tracking number: ${trackingInfo.trackingNumber}, Carrier: ${trackingInfo.carrier}`);
    // In a real implementation, this would send an actual email
  },
};

// Create client
const transport = new InMemoryTransport();
const client = new Client(transport, {
  clientId: "notification-service",
  clientType: "service",
  autoReconnect: true,
});

async function startNotificationService() {
  // Connect to order service
  await client.connect("memory://order-service");
  console.log("Notification service connected to order service");
  
  // Subscribe to orderCreated events
  client.on("orderCreated", async (payload, context) => {
    console.log(`Received orderCreated event for order ${payload.orderId}`);
    
    // Fetch order details
    const order = await client.request("getOrderById", {
      orderId: payload.orderId,
    });
    
    // Send order confirmation email
    await emailService.sendOrderConfirmation(payload.customerId, {
      orderId: payload.orderId,
      totalAmount: payload.totalAmount,
      items: order.items,
    });
  });
  
  // Subscribe to orderStatusChanged events
  client.on("orderStatusChanged", async (payload, context) => {
    console.log(`Received orderStatusChanged event for order ${payload.orderId}`);
    console.log(`Status changed from ${payload.previousStatus} to ${payload.newStatus}`);
    
    // Fetch order details
    const order = await client.request("getOrderById", {
      orderId: payload.orderId,
    });
    
    // Send status update email
    await emailService.sendOrderStatusUpdate(order.customerId, {
      orderId: payload.orderId,
      status: payload.newStatus,
    }, payload.newStatus);
  });
  
  // Subscribe to orderShipped events
  client.on("orderShipped", async (payload, context) => {
    console.log(`Received orderShipped event for order ${payload.orderId}`);
    
    // Fetch order details
    const order = await client.request("getOrderById", {
      orderId: payload.orderId,
    });
    
    // Send shipping notification email
    await emailService.sendShippingNotification(order.customerId, {
      orderId: payload.orderId,
    }, {
      trackingNumber: payload.trackingNumber,
      carrier: payload.carrier,
      estimatedDelivery: new Date(payload.estimatedDelivery).toDateString(),
    });
  });
}

startNotificationService().catch(console.error);
```

### API Gateway

Implement an API gateway that exposes the order service to external clients:

```typescript
// api-gateway.ts
import express from "express";
import { Client, InMemoryTransport, createMessageContext } from "@magicbutton.cloud/messaging";
import { orderServiceContract } from "./contracts/order-service";

// Create order service client
const transport = new InMemoryTransport();
const orderClient = new Client(transport, {
  clientId: "api-gateway",
  clientType: "gateway",
  autoReconnect: true,
});

// Create Express app
const app = express();
app.use(express.json());

async function startApiGateway() {
  // Connect to order service
  await orderClient.connect("memory://order-service");
  console.log("API gateway connected to order service");
  
  // Middleware to create message context
  const createContext = (req, res, next) => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : null;
    
    // Create context with auth information
    req.messageContext = createMessageContext({
      source: "api-gateway",
      target: "order-service",
      auth: token 
        ? { 
            token,
            // In a real implementation, you would decode and verify the token
            actor: {
              id: "user-123", // This would come from the token
              type: "user",
              roles: ["customer"], // These would come from the token
            }
          } 
        : undefined,
      metadata: {
        requestId: req.headers["x-request-id"] || crypto.randomUUID(),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
    
    next();
  };
  
  // Error handling middleware
  const errorHandler = (err, req, res, next) => {
    console.error("API error:", err);
    
    // Format the error response
    const status = err.status || 500;
    const response = {
      error: {
        code: err.code || "INTERNAL_SERVER_ERROR",
        message: err.message || "An unexpected error occurred",
      },
    };
    
    if (err.details) {
      response.error.details = err.details;
    }
    
    res.status(status).json(response);
  };
  
  // Use the middlewares
  app.use(createContext);
  
  // Create order endpoint
  app.post("/orders", async (req, res, next) => {
    try {
      const order = await orderClient.request("createOrder", {
        customerId: req.body.customerId,
        items: req.body.items,
        shippingAddress: req.body.shippingAddress,
      }, req.messageContext);
      
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  });
  
  // Get order endpoint
  app.get("/orders/:orderId", async (req, res, next) => {
    try {
      const order = await orderClient.request("getOrderById", {
        orderId: req.params.orderId,
      }, req.messageContext);
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });
  
  // Update order status endpoint
  app.put("/orders/:orderId/status", async (req, res, next) => {
    try {
      const order = await orderClient.request("updateOrderStatus", {
        orderId: req.params.orderId,
        status: req.body.status,
        trackingInfo: req.body.trackingInfo,
      }, req.messageContext);
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });
  
  // Cancel order endpoint
  app.post("/orders/:orderId/cancel", async (req, res, next) => {
    try {
      const order = await orderClient.request("cancelOrder", {
        orderId: req.params.orderId,
        reason: req.body.reason,
      }, req.messageContext);
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });
  
  // Use error handler
  app.use(errorHandler);
  
  // Start the server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`API gateway listening on port ${port}`);
  });
}

startApiGateway().catch(console.error);
```

## Web Socket Real-Time Updates

This example demonstrates how to use Magic Button Messaging with WebSockets for real-time updates.

### WebSocket Transport Adapter

First, implement a WebSocket transport adapter:

```typescript
// websocket-transport.ts
import { 
  TransportAdapter, 
  MessageContext, 
  AuthResult 
} from "@magicbutton.cloud/messaging";
import WebSocket from "ws";

export class WebSocketTransport<TEvents extends Record<string, any>, TRequests extends Record<string, any>>
  implements TransportAdapter<TEvents, TRequests> {
  
  private socket: WebSocket | null = null;
  private server: WebSocket.Server | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private isServer: boolean = false;
  private connected = false;
  private connectionString = "";
  private eventHandlers = new Map<string, Set<(payload: any, context: MessageContext) => void>>();
  private requestHandlers = new Map<string, (payload: any, context: MessageContext) => Promise<any>>();
  private pendingRequests = new Map<string, { 
    resolve: (value: any) => void, 
    reject: (reason: any) => void 
  }>();
  
  async connect(connectionString: string): Promise<void> {
    if (this.connected) return;
    
    this.connectionString = connectionString;
    const url = new URL(connectionString);
    
    // Determine if this is a client or server
    this.isServer = url.pathname.includes("/server");
    
    if (this.isServer) {
      // Create WebSocket server
      const port = parseInt(url.port || "8080", 10);
      this.server = new WebSocket.Server({ port });
      
      this.server.on("connection", (socket, request) => {
        const clientId = crypto.randomUUID();
        this.clients.set(clientId, socket);
        
        socket.on("message", (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleServerMessage(message, socket, clientId);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        });
        
        socket.on("close", () => {
          this.clients.delete(clientId);
        });
      });
      
      this.connected = true;
      console.log(`WebSocket server listening on port ${port}`);
    } else {
      // Create WebSocket client
      return new Promise((resolve, reject) => {
        try {
          this.socket = new WebSocket(connectionString);
          
          this.socket.onopen = () => {
            this.connected = true;
            resolve();
          };
          
          this.socket.onerror = (error) => {
            reject(new Error(`WebSocket error: ${error}`));
          };
          
          this.socket.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data.toString());
              this.handleClientMessage(message);
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
  }
  
  async disconnect(): Promise<void> {
    if (!this.connected) return;
    
    if (this.isServer) {
      return new Promise((resolve) => {
        if (this.server) {
          this.server.close(() => {
            this.connected = false;
            this.server = null;
            resolve();
          });
        } else {
          this.connected = false;
          resolve();
        }
      });
    } else {
      return new Promise((resolve) => {
        if (this.socket) {
          this.socket.onclose = () => {
            this.connected = false;
            this.socket = null;
            resolve();
          };
          
          this.socket.close();
        } else {
          this.connected = false;
          resolve();
        }
      });
    }
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
    if (!this.connected) {
      throw new Error("Not connected");
    }
    
    const message = {
      type: "event",
      event,
      payload,
      context,
    };
    
    if (this.isServer) {
      // Broadcast to all clients
      const messageString = JSON.stringify(message);
      for (const client of this.clients.values()) {
        client.send(messageString);
      }
    } else if (this.socket) {
      // Send to server
      this.socket.send(JSON.stringify(message));
    }
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
    if (!this.connected) {
      throw new Error("Not connected");
    }
    
    const requestId = crypto.randomUUID();
    
    const message = {
      type: "request",
      requestId,
      requestType,
      payload,
      context,
    };
    
    return new Promise((resolve, reject) => {
      // Store the promise resolvers
      this.pendingRequests.set(requestId, { resolve, reject });
      
      if (this.isServer) {
        // Send to specific client
        const clientId = context.target;
        const client = clientId ? this.clients.get(clientId) : null;
        
        if (!client) {
          this.pendingRequests.delete(requestId);
          reject(new Error(`Client not found: ${clientId}`));
          return;
        }
        
        client.send(JSON.stringify(message));
      } else if (this.socket) {
        // Send to server
        this.socket.send(JSON.stringify(message));
      }
      
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
    this.requestHandlers.set(requestType as string, handler);
  }
  
  private async handleServerMessage(message: any, socket: WebSocket, clientId: string): Promise<void> {
    if (message.type === "event") {
      // Handle incoming event
      const handlers = this.eventHandlers.get(message.event);
      if (handlers) {
        const context = {
          ...message.context,
          source: clientId,
        };
        
        for (const handler of handlers) {
          try {
            await handler(message.payload, context);
          } catch (error) {
            console.error(`Error in event handler for ${message.event}:`, error);
          }
        }
      }
    } else if (message.type === "request") {
      // Handle incoming request
      const handler = this.requestHandlers.get(message.requestType);
      
      if (handler) {
        try {
          const context = {
            ...message.context,
            source: clientId,
          };
          
          const result = await handler(message.payload, context);
          
          // Send response
          socket.send(JSON.stringify({
            type: "response",
            requestId: message.requestId,
            success: true,
            data: result,
          }));
        } catch (error) {
          // Send error response
          socket.send(JSON.stringify({
            type: "response",
            requestId: message.requestId,
            success: false,
            error: {
              code: error.code || "UNKNOWN_ERROR",
              message: error.message || "Unknown error",
              details: error.details,
            },
          }));
        }
      } else {
        // Send error response for unknown request type
        socket.send(JSON.stringify({
          type: "response",
          requestId: message.requestId,
          success: false,
          error: {
            code: "UNKNOWN_REQUEST_TYPE",
            message: `Unknown request type: ${message.requestType}`,
          },
        }));
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
  
  private handleClientMessage(message: any): void {
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
      // Client can't handle requests from server in this implementation
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
    if (!this.connected) {
      throw new Error("Not connected");
    }
    
    return this.request("$login" as any, credentials);
  }
  
  async logout(): Promise<void> {
    if (!this.connected) {
      throw new Error("Not connected");
    }
    
    return this.request("$logout" as any, {});
  }
}
```

### Real-Time Dashboard Server

Next, implement a real-time dashboard server:

```typescript
// dashboard-server.ts
import { Server } from "@magicbutton.cloud/messaging";
import { WebSocketTransport } from "./websocket-transport";
import { orderServiceContract } from "./contracts/order-service";
import { Client, InMemoryTransport } from "@magicbutton.cloud/messaging";

// Connect to order service
const orderServiceClient = new Client(new InMemoryTransport(), {
  clientId: "dashboard-server",
  clientType: "service",
  autoReconnect: true,
});

// Create WebSocket server
const wsTransport = new WebSocketTransport();
const dashboardServer = new Server(wsTransport);

async function startDashboardServer() {
  // Connect to order service
  await orderServiceClient.connect("memory://order-service");
  console.log("Dashboard server connected to order service");
  
  // Subscribe to order events
  orderServiceClient.on("orderCreated", async (payload, context) => {
    // Forward to dashboard clients
    await dashboardServer.broadcast("orderCreated", payload);
  });
  
  orderServiceClient.on("orderStatusChanged", async (payload, context) => {
    // Forward to dashboard clients
    await dashboardServer.broadcast("orderStatusChanged", payload);
  });
  
  orderServiceClient.on("orderShipped", async (payload, context) => {
    // Forward to dashboard clients
    await dashboardServer.broadcast("orderShipped", payload);
  });
  
  // Handle dashboard requests
  dashboardServer.handleRequest("getRecentOrders", async (payload, context, clientId) => {
    // Get recent orders from order service
    try {
      const recentOrders = await orderServiceClient.request("getRecentOrders", {
        limit: payload.limit || 10,
        page: payload.page || 1,
      });
      
      return recentOrders;
    } catch (error) {
      console.error("Error getting recent orders:", error);
      throw error;
    }
  });
  
  dashboardServer.handleRequest("getOrderById", async (payload, context, clientId) => {
    // Get order details from order service
    try {
      const order = await orderServiceClient.request("getOrderById", {
        orderId: payload.orderId,
      });
      
      return order;
    } catch (error) {
      console.error("Error getting order details:", error);
      throw error;
    }
  });
  
  dashboardServer.handleRequest("getDashboardStats", async (payload, context, clientId) => {
    // Get dashboard statistics
    try {
      // This would typically come from a dedicated stats service or analytics database
      return {
        totalOrders: 1250,
        pendingOrders: 42,
        processingOrders: 78,
        shippedOrders: 130,
        deliveredOrders: 990,
        cancelledOrders: 10,
        totalRevenue: 125000,
        averageOrderValue: 100,
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      throw error;
    }
  });
  
  // Start the WebSocket server
  await dashboardServer.start("ws://localhost:8080/server/dashboard");
  console.log("Dashboard server started on ws://localhost:8080/server/dashboard");
}

startDashboardServer().catch(console.error);
```

### Dashboard Web Client

Finally, implement a dashboard web client:

```typescript
// dashboard-client.js
import { Client } from "@magicbutton.cloud/messaging";
import { WebSocketTransport } from "./websocket-transport";

// Create WebSocket client
const wsTransport = new WebSocketTransport();
const dashboardClient = new Client(wsTransport, {
  clientId: "dashboard-web-client",
  clientType: "web",
  autoReconnect: true,
});

// Connect to dashboard server
async function connectToDashboardServer() {
  try {
    await dashboardClient.connect("ws://localhost:8080/client/dashboard");
    console.log("Connected to dashboard server");
    
    // Initialize dashboard
    await initializeDashboard();
    
    // Subscribe to events
    setupEventSubscriptions();
  } catch (error) {
    console.error("Failed to connect to dashboard server:", error);
    // Retry connection after a delay
    setTimeout(connectToDashboardServer, 5000);
  }
}

// Initialize dashboard with data
async function initializeDashboard() {
  try {
    // Get dashboard statistics
    const stats = await dashboardClient.request("getDashboardStats", {});
    updateDashboardStats(stats);
    
    // Get recent orders
    const recentOrders = await dashboardClient.request("getRecentOrders", {
      limit: 20,
    });
    updateRecentOrdersList(recentOrders);
  } catch (error) {
    console.error("Error initializing dashboard:", error);
  }
}

// Set up event subscriptions
function setupEventSubscriptions() {
  // Subscribe to order created events
  dashboardClient.on("orderCreated", (payload, context) => {
    console.log("New order created:", payload);
    // Update the UI with the new order
    addOrderToRecentList(payload);
    updateOrderCounter();
  });
  
  // Subscribe to order status changed events
  dashboardClient.on("orderStatusChanged", (payload, context) => {
    console.log("Order status changed:", payload);
    // Update the UI with the new status
    updateOrderStatus(payload);
    updateStatusCharts();
  });
  
  // Subscribe to order shipped events
  dashboardClient.on("orderShipped", (payload, context) => {
    console.log("Order shipped:", payload);
    // Update the UI with shipping information
    updateOrderShippingInfo(payload);
  });
}

// UI update functions
function updateDashboardStats(stats) {
  document.getElementById("total-orders").textContent = stats.totalOrders;
  document.getElementById("pending-orders").textContent = stats.pendingOrders;
  document.getElementById("processing-orders").textContent = stats.processingOrders;
  document.getElementById("shipped-orders").textContent = stats.shippedOrders;
  document.getElementById("delivered-orders").textContent = stats.deliveredOrders;
  document.getElementById("cancelled-orders").textContent = stats.cancelledOrders;
  document.getElementById("total-revenue").textContent = `$${stats.totalRevenue.toFixed(2)}`;
  document.getElementById("average-order-value").textContent = `$${stats.averageOrderValue.toFixed(2)}`;
}

function updateRecentOrdersList(orders) {
  const ordersList = document.getElementById("recent-orders-list");
  ordersList.innerHTML = "";
  
  orders.forEach(order => {
    const orderElement = document.createElement("div");
    orderElement.className = "order-item";
    orderElement.innerHTML = `
      <div class="order-id">${order.id}</div>
      <div class="order-customer">${order.customerId}</div>
      <div class="order-amount">$${order.totalAmount.toFixed(2)}</div>
      <div class="order-status ${order.status}">${order.status}</div>
      <div class="order-date">${new Date(order.createdAt).toLocaleString()}</div>
    `;
    
    orderElement.addEventListener("click", () => {
      viewOrderDetails(order.id);
    });
    
    ordersList.appendChild(orderElement);
  });
}

function addOrderToRecentList(orderInfo) {
  // Get full order details
  dashboardClient.request("getOrderById", {
    orderId: orderInfo.orderId,
  }).then(order => {
    const ordersList = document.getElementById("recent-orders-list");
    
    // Create new order element
    const orderElement = document.createElement("div");
    orderElement.className = "order-item new-order";
    orderElement.innerHTML = `
      <div class="order-id">${order.id}</div>
      <div class="order-customer">${order.customerId}</div>
      <div class="order-amount">$${order.totalAmount.toFixed(2)}</div>
      <div class="order-status ${order.status}">${order.status}</div>
      <div class="order-date">${new Date(order.createdAt).toLocaleString()}</div>
    `;
    
    orderElement.addEventListener("click", () => {
      viewOrderDetails(order.id);
    });
    
    // Add to the beginning of the list
    ordersList.insertBefore(orderElement, ordersList.firstChild);
    
    // Remove the last item if the list gets too long
    if (ordersList.children.length > 20) {
      ordersList.removeChild(ordersList.lastChild);
    }
    
    // Highlight the new order briefly
    setTimeout(() => {
      orderElement.classList.remove("new-order");
    }, 3000);
  }).catch(error => {
    console.error("Error fetching order details:", error);
  });
}

function updateOrderStatus(statusInfo) {
  // Find the order in the list
  const orderItems = document.querySelectorAll(".order-item");
  for (const item of orderItems) {
    const orderId = item.querySelector(".order-id").textContent;
    if (orderId === statusInfo.orderId) {
      // Update the status
      const statusElement = item.querySelector(".order-status");
      statusElement.className = `order-status ${statusInfo.newStatus}`;
      statusElement.textContent = statusInfo.newStatus;
      
      // Highlight the updated order briefly
      item.classList.add("updated-order");
      setTimeout(() => {
        item.classList.remove("updated-order");
      }, 3000);
      
      break;
    }
  }
}

function updateOrderShippingInfo(shippingInfo) {
  // This would update shipping information in the order details view
  console.log("Updating shipping info for order:", shippingInfo.orderId);
}

function updateOrderCounter() {
  // Increment the total orders counter
  const totalOrdersElement = document.getElementById("total-orders");
  const currentCount = parseInt(totalOrdersElement.textContent, 10);
  totalOrdersElement.textContent = currentCount + 1;
  
  // Increment the pending orders counter
  const pendingOrdersElement = document.getElementById("pending-orders");
  const pendingCount = parseInt(pendingOrdersElement.textContent, 10);
  pendingOrdersElement.textContent = pendingCount + 1;
}

function updateStatusCharts() {
  // This would update any charts or visualizations based on order status
  console.log("Updating status charts");
}

function viewOrderDetails(orderId) {
  // Fetch and display detailed order information
  dashboardClient.request("getOrderById", {
    orderId,
  }).then(order => {
    showOrderDetailsModal(order);
  }).catch(error => {
    console.error("Error fetching order details:", error);
  });
}

function showOrderDetailsModal(order) {
  // Display a modal with order details
  console.log("Showing details for order:", order.id);
  // In a real implementation, this would populate and show a modal
}

// Connect to dashboard server when the page loads
window.addEventListener("DOMContentLoaded", connectToDashboardServer);
```

## Reactive Programming with RxJS

This example demonstrates how to integrate Magic Button Messaging with RxJS for reactive programming:

```typescript
// reactive-messaging.ts
import { 
  Client, 
  Server, 
  InMemoryTransport, 
  createMessageContext 
} from "@magicbutton.cloud/messaging";
import { 
  Observable, 
  Subject, 
  ReplaySubject, 
  filter, 
  map, 
  scan, 
  share 
} from "rxjs";

// Create a reactive client wrapper
class ReactiveClient<TEvents extends Record<string, any>, TRequests extends Record<string, any>> {
  private client: Client<TEvents, TRequests>;
  private events = new Subject<{ type: string; payload: any; context: any }>();
  private connectionStatus = new ReplaySubject<string>(1);
  
  constructor(client: Client<TEvents, TRequests>) {
    this.client = client;
    
    // Forward connection status events
    this.client.onStatusChange((status) => {
      this.connectionStatus.next(status);
    });
  }
  
  // Connect to server
  async connect(connectionString: string): Promise<void> {
    return this.client.connect(connectionString);
  }
  
  // Disconnect from server
  async disconnect(): Promise<void> {
    return this.client.disconnect();
  }
  
  // Get connection status as observable
  getConnectionStatus(): Observable<string> {
    return this.connectionStatus.asObservable();
  }
  
  // Subscribe to an event and get an observable
  on<E extends string & keyof TEvents>(eventType: E): Observable<{
    payload: any;
    context: any;
  }> {
    // Create a filter for this event type
    const observable = this.events.pipe(
      filter(event => event.type === eventType),
      map(event => ({
        payload: event.payload,
        context: event.context,
      })),
      share()
    );
    
    // Register handler
    this.client.on(eventType, (payload, context) => {
      this.events.next({
        type: eventType,
        payload,
        context,
      });
    });
    
    return observable;
  }
  
  // Send a request
  async request<R extends string & keyof TRequests>(
    requestType: R,
    payload: any,
    context?: any
  ): Promise<any> {
    return this.client.request(requestType, payload, context);
  }
  
  // Emit an event
  async emit<E extends string & keyof TEvents>(
    eventType: E,
    payload: any,
    context?: any
  ): Promise<void> {
    return this.client.emit(eventType, payload, context);
  }
}

// Example usage
async function reactiveExample() {
  // Create a transport
  const transport = new InMemoryTransport();
  
  // Create a server
  const server = new Server(transport);
  await server.start("memory://reactive-example");
  
  // Set up server to handle requests and emit events
  server.handleRequest("getCounter", async (payload, context, clientId) => {
    return { counter: 42 };
  });
  
  server.handleRequest("increment", async (payload, context, clientId) => {
    // Emit counter changed event
    await server.broadcast("counterChanged", {
      counter: payload.value,
      timestamp: Date.now(),
    });
    
    return { success: true };
  });
  
  // Create a client
  const client = new Client(new InMemoryTransport());
  
  // Create a reactive client wrapper
  const reactiveClient = new ReactiveClient(client);
  
  // Connect to server
  await reactiveClient.connect("memory://reactive-example");
  
  // Subscribe to connection status
  reactiveClient.getConnectionStatus().subscribe(status => {
    console.log(`Connection status: ${status}`);
  });
  
  // Subscribe to counter changed events
  const counterChanges = reactiveClient.on("counterChanged");
  
  // Process counter changes with RxJS operators
  counterChanges.pipe(
    map(event => event.payload.counter),
    scan((acc, value) => {
      // Accumulate counter values
      acc.push(value);
      // Keep only the last 5 values
      if (acc.length > 5) {
        acc.shift();
      }
      return acc;
    }, [] as number[])
  ).subscribe(counters => {
    console.log("Recent counter values:", counters);
    console.log("Average:", counters.reduce((sum, val) => sum + val, 0) / counters.length);
  });
  
  // Send some increment requests
  for (let i = 1; i <= 10; i++) {
    await reactiveClient.request("increment", { value: i * 10 });
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Clean up
  await reactiveClient.disconnect();
  await server.stop();
}

reactiveExample().catch(console.error);
```

## Custom Middleware Pipeline

This example demonstrates how to create and use a custom middleware pipeline:

```typescript
// custom-middleware.ts
import { 
  Server, 
  Client, 
  InMemoryTransport, 
  MiddlewareManager, 
  EventMiddleware, 
  RequestMiddleware, 
  createRequestValidationMiddleware, 
  createEventValidationMiddleware 
} from "@magicbutton.cloud/messaging";
import * as z from "zod";

// Define schemas
const eventSchemas = {
  userCreated: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string().email(),
    createdAt: z.number(),
  }),
};

const requestSchemas = {
  createUser: {
    requestSchema: z.object({
      username: z.string().min(3).max(50),
      email: z.string().email(),
      password: z.string().min(8),
    }),
    responseSchema: z.object({
      id: z.string(),
      username: z.string(),
      email: z.string().email(),
      createdAt: z.number(),
    }),
  },
  getUserById: {
    requestSchema: z.object({
      id: z.string(),
    }),
    responseSchema: z.object({
      id: z.string(),
      username: z.string(),
      email: z.string().email(),
      createdAt: z.number(),
    }),
  },
};

// Create middleware manager
const middlewareManager = new MiddlewareManager();

// 1. Logging middleware
const loggingMiddleware: RequestMiddleware = async (request, next) => {
  console.log(`Request received: ${request.type}`, request.payload);
  const startTime = Date.now();
  
  try {
    const response = await next(request);
    
    const duration = Date.now() - startTime;
    console.log(`Request processed: ${request.type} in ${duration}ms`);
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Error processing request: ${request.type} in ${duration}ms`, error);
    throw error;
  }
};

// 2. Authentication middleware
const authMiddleware: RequestMiddleware = async (request, next) => {
  // Skip auth for public endpoints
  if (request.type === "login" || request.type === "register") {
    return next(request);
  }
  
  // Check token
  if (!request.context?.auth?.token) {
    return {
      success: false,
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required for this request",
      },
      context: request.context,
    };
  }
  
  // In a real implementation, you would verify the token
  const token = request.context.auth.token;
  
  // For this example, we'll just check if it's a non-empty string
  if (typeof token !== "string" || !token) {
    return {
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid authentication token",
      },
      context: request.context,
    };
  }
  
  // Add user info to context
  request.context.auth.actor = {
    id: "user-123", // This would come from token verification
    type: "user",
    roles: ["user"], // These would come from token verification
  };
  
  return next(request);
};

// 3. Rate limiting middleware
const rateLimitMiddleware: RequestMiddleware = async (request, next) => {
  // In a real implementation, you would use a rate limiter like Redis
  // For this example, we'll use a simple in-memory map
  const ipAddress = request.context?.metadata?.ipAddress || "unknown";
  const key = `${ipAddress}:${request.type}`;
  
  // Check if rate limited
  const isRateLimited = false; // This would be a real check
  
  if (isRateLimited) {
    return {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Rate limit exceeded. Please try again later.",
      },
      context: request.context,
    };
  }
  
  return next(request);
};

// 4. Validation middleware
const validationMiddleware = createRequestValidationMiddleware(requestSchemas);

// 5. Metrics middleware
const metricsMiddleware: RequestMiddleware = async (request, next) => {
  const startTime = Date.now();
  
  try {
    const response = await next(request);
    
    const duration = Date.now() - startTime;
    
    // Record metrics
    console.log(`Recording metrics for ${request.type}`, {
      duration,
      success: response.success,
    });
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Record error metrics
    console.log(`Recording error metrics for ${request.type}`, {
      duration,
      error: error.code || "UNKNOWN_ERROR",
    });
    
    throw error;
  }
};

// Register global middleware
middlewareManager.useGlobalRequestMiddleware(loggingMiddleware);
middlewareManager.useGlobalRequestMiddleware(authMiddleware);
middlewareManager.useGlobalRequestMiddleware(rateLimitMiddleware);
middlewareManager.useGlobalRequestMiddleware(validationMiddleware);
middlewareManager.useGlobalRequestMiddleware(metricsMiddleware);

// Register event validation middleware
middlewareManager.useGlobalEventMiddleware(createEventValidationMiddleware(eventSchemas));

// Create server with mock user database
async function startServer() {
  const transport = new InMemoryTransport();
  const server = new Server(transport);
  
  // Mock user database
  const users = new Map<string, any>();
  
  // Handle create user request
  server.handleRequest("createUser", async (payload, context, clientId) => {
    // Process request through middleware
    const request = {
      type: "createUser",
      payload,
      context,
    };
    
    const response = await middlewareManager.processRequest(request);
    
    // If middleware returned an error, return it
    if (!response.success) {
      throw new Error(response.error?.code || "UNKNOWN_ERROR");
    }
    
    // Create the user
    const userId = `user-${Date.now()}`;
    const user = {
      id: userId,
      username: payload.username,
      email: payload.email,
      // In a real implementation, you would hash the password
      password: payload.password,
      createdAt: Date.now(),
    };
    
    // Save to database
    users.set(userId, user);
    
    // Process userCreated event through middleware
    await middlewareManager.processEvent({
      type: "userCreated",
      payload: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      context,
    });
    
    // Emit event
    await server.broadcast("userCreated", {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    });
    
    // Return user (without password)
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
  });
  
  // Handle get user by id request
  server.handleRequest("getUserById", async (payload, context, clientId) => {
    // Process request through middleware
    const request = {
      type: "getUserById",
      payload,
      context,
    };
    
    const response = await middlewareManager.processRequest(request);
    
    // If middleware returned an error, return it
    if (!response.success) {
      throw new Error(response.error?.code || "UNKNOWN_ERROR");
    }
    
    // Get the user
    const user = users.get(payload.id);
    
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    
    // Return user (without password)
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
  });
  
  // Start the server
  await server.start("memory://user-service");
  console.log("Server started");
  
  return server;
}

// Example client usage
async function clientExample() {
  const transport = new InMemoryTransport();
  const client = new Client(transport);
  
  // Connect to server
  await client.connect("memory://user-service");
  console.log("Client connected");
  
  // Create a user
  try {
    const user = await client.request("createUser", {
      username: "john_doe",
      email: "john@example.com",
      password: "password123",
    });
    
    console.log("User created:", user);
    
    // Get the user
    const fetchedUser = await client.request("getUserById", {
      id: user.id,
    }, {
      auth: {
        token: "fake-token", // This would be a real token in a production system
      },
    });
    
    console.log("Fetched user:", fetchedUser);
  } catch (error) {
    console.error("Error:", error);
  }
  
  // Clean up
  await client.disconnect();
}

// Run the example
async function runMiddlewareExample() {
  const server = await startServer();
  
  await clientExample();
  
  await server.stop();
}

runMiddlewareExample().catch(console.error);
```

These examples demonstrate advanced use cases for Magic Button Messaging in various scenarios, from microservices communication to real-time updates and reactive programming. By adapting these patterns to your specific needs, you can build robust, scalable, and maintainable distributed systems.