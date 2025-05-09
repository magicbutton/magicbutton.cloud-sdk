---
sidebar_position: 4
---

# Observability

Observability is a critical aspect of distributed systems that allows you to understand the behavior and performance of your application. Magic Button Messaging provides comprehensive observability features including logging, metrics, and distributed tracing.

## Observability Overview

Magic Button Messaging's observability features include:

1. **Logging**: Structured logging with different log levels
2. **Metrics**: Collection of performance and operational metrics
3. **Distributed Tracing**: End-to-end tracing of messages across services
4. **Context Propagation**: Passing of tracing information between services

These features are designed to work together to provide a complete picture of your application's behavior.

## Observability Provider

The observability system is centered around the `ObservabilityProvider` interface, which defines the core functionality:

```typescript
export interface ObservabilityProvider {
  getLogger(name: string): Logger;
  getMetrics(): Metrics;
  getTracer(name: string): Tracer;
}
```

Magic Button Messaging comes with a default implementation, `DefaultObservabilityProvider`, which provides basic functionality out of the box:

```typescript
import { 
  DefaultObservabilityProvider, 
  LogLevel, 
  setObservabilityProvider 
} from "@magicbutton.cloud/messaging";

// Create an observability provider with DEBUG log level
const observabilityProvider = new DefaultObservabilityProvider(LogLevel.DEBUG);

// Set it as the global provider
setObservabilityProvider(observabilityProvider);
```

## Logging

The logging system is based on the `Logger` interface, which provides methods for different log levels:

```typescript
export interface Logger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
}
```

### Getting a Logger

You can get a logger for a specific component using the `getLogger` method:

```typescript
import { getObservabilityProvider } from "@magicbutton.cloud/messaging";

// Get a logger for the order service
const logger = getObservabilityProvider().getLogger("order-service");

// Log messages
logger.info("Order service starting up");
logger.debug("Processing order", { orderId: "order-123" });
logger.warn("Low inventory for product", { productId: "product-456", quantity: 5 });
logger.error("Failed to process payment", new Error("Gateway timeout"), { 
  orderId: "order-123", 
  paymentMethod: "credit-card",
});
```

### Console Logger

The default implementation, `ConsoleLogger`, outputs log messages to the console:

```typescript
import { ConsoleLogger, LogLevel } from "@magicbutton.cloud/messaging";

// Create a console logger with custom name and log level
const logger = new ConsoleLogger("payment-service", LogLevel.INFO);

// Log messages
logger.info("Payment service initialized");
```

The output format includes a timestamp, log level, logger name, and the message:

```
[2023-05-15T10:30:45.123Z] [INFO] [payment-service] Payment service initialized
```

If you include context, it's added as JSON at the end:

```
[2023-05-15T10:30:45.123Z] [INFO] [payment-service] Processing payment {"paymentId":"payment-123","amount":99.99}
```

### Custom Logger Implementation

You can implement your own logger by creating a class that implements the `Logger` interface:

```typescript
import { Logger, LogLevel } from "@magicbutton.cloud/messaging";

// Create a custom logger that integrates with Winston
export class WinstonLogger implements Logger {
  private winston: any; // Winston logger instance
  private name: string;
  
  constructor(name: string, winston) {
    this.name = name;
    this.winston = winston;
  }
  
  debug(message: string, context?: Record<string, any>): void {
    this.winston.debug(message, { service: this.name, ...context });
  }
  
  info(message: string, context?: Record<string, any>): void {
    this.winston.info(message, { service: this.name, ...context });
  }
  
  warn(message: string, context?: Record<string, any>): void {
    this.winston.warn(message, { service: this.name, ...context });
  }
  
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.winston.error(message, { 
      service: this.name, 
      error: error ? { message: error.message, stack: error.stack } : undefined,
      ...context 
    });
  }
}

// Register your custom logger
const observabilityProvider = new DefaultObservabilityProvider();
observabilityProvider.setLogger("order-service", new WinstonLogger("order-service", winston));
setObservabilityProvider(observabilityProvider);
```

## Metrics

The metrics system is based on the `Metrics` interface, which provides methods for different types of metrics:

```typescript
export interface Metrics {
  increment(name: string, value?: number, tags?: Record<string, string>): void;
  gauge(name: string, value: number, tags?: Record<string, string>): void;
  histogram(name: string, value: number, tags?: Record<string, string>): void;
  timing(name: string, value: number, tags?: Record<string, string>): void;
}
```

### Getting Metrics

You can get the metrics instance using the `getMetrics` method:

```typescript
import { getObservabilityProvider } from "@magicbutton.cloud/messaging";

// Get the metrics instance
const metrics = getObservabilityProvider().getMetrics();

// Record metrics
metrics.increment("orders.count", 1, { status: "completed" });
metrics.gauge("inventory.level", 42, { productId: "product-123" });
metrics.histogram("order.items.count", 3, { category: "electronics" });
metrics.timing("payment.processing.time", 150, { provider: "stripe" });
```

### NoopMetrics

The default implementation, `NoopMetrics`, doesn't actually record any metrics. It's a placeholder that allows your code to call metrics methods without error, even if you haven't set up a metrics system.

### Custom Metrics Implementation

You can implement your own metrics by creating a class that implements the `Metrics` interface:

```typescript
import { Metrics } from "@magicbutton.cloud/messaging";

// Create a custom metrics implementation that integrates with StatsD
export class StatsDMetrics implements Metrics {
  private statsd: any; // StatsD client
  
  constructor(statsd) {
    this.statsd = statsd;
  }
  
  increment(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.statsd.increment(name, value, this.formatTags(tags));
  }
  
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.statsd.gauge(name, value, this.formatTags(tags));
  }
  
  histogram(name: string, value: number, tags?: Record<string, string>): void {
    this.statsd.histogram(name, value, this.formatTags(tags));
  }
  
  timing(name: string, value: number, tags?: Record<string, string>): void {
    this.statsd.timing(name, value, this.formatTags(tags));
  }
  
  private formatTags(tags?: Record<string, string>): string[] {
    if (!tags) return [];
    return Object.entries(tags).map(([key, value]) => `${key}:${value}`);
  }
}

// Register your custom metrics implementation
const observabilityProvider = new DefaultObservabilityProvider();
observabilityProvider.setMetrics(new StatsDMetrics(statsd));
setObservabilityProvider(observabilityProvider);
```

## Distributed Tracing

The tracing system is based on the `Tracer` and `Span` interfaces, which provide methods for distributed tracing:

```typescript
export interface Span {
  setTag(key: string, value: string | number | boolean): this;
  setError(error: Error): this;
  finish(): void;
}

export interface Tracer {
  startSpan(name: string, options?: { childOf?: Span }): Span;
  inject(span: Span, format: string, carrier: unknown): void;
  extract(format: string, carrier: unknown): Span | null;
}
```

### Getting a Tracer

You can get a tracer for a specific component using the `getTracer` method:

```typescript
import { getObservabilityProvider } from "@magicbutton.cloud/messaging";

// Get a tracer for the order service
const tracer = getObservabilityProvider().getTracer("order-service");

// Start a span
const span = tracer.startSpan("process-order");

try {
  // Set tags
  span.setTag("order.id", "order-123");
  span.setTag("customer.id", "customer-456");
  
  // Perform the operation
  const result = await processOrder("order-123");
  
  // Set more tags
  span.setTag("order.status", result.status);
  span.setTag("order.amount", result.amount);
} catch (error) {
  // Record the error
  span.setError(error);
  throw error;
} finally {
  // Finish the span
  span.finish();
}
```

### NoopTracer and NoopSpan

The default implementations, `NoopTracer` and `NoopSpan`, don't actually record any traces. They're placeholders that allow your code to call tracing methods without error, even if you haven't set up a tracing system.

### Custom Tracer Implementation

You can implement your own tracer by creating classes that implement the `Tracer` and `Span` interfaces:

```typescript
import { Tracer, Span } from "@magicbutton.cloud/messaging";

// Create a custom span implementation that integrates with OpenTelemetry
export class OpenTelemetrySpan implements Span {
  private span: any; // OpenTelemetry span
  
  constructor(span) {
    this.span = span;
  }
  
  setTag(key: string, value: string | number | boolean): this {
    this.span.setAttribute(key, value);
    return this;
  }
  
  setError(error: Error): this {
    this.span.recordException(error);
    this.span.setStatus({ code: 2, message: error.message }); // Error status
    return this;
  }
  
  finish(): void {
    this.span.end();
  }
}

// Create a custom tracer implementation that integrates with OpenTelemetry
export class OpenTelemetryTracer implements Tracer {
  private tracer: any; // OpenTelemetry tracer
  
  constructor(tracer) {
    this.tracer = tracer;
  }
  
  startSpan(name: string, options?: { childOf?: Span }): Span {
    const context = options?.childOf 
      ? (options.childOf as OpenTelemetrySpan).span.spanContext()
      : undefined;
    
    const span = this.tracer.startSpan(name, { 
      parent: context, 
    });
    
    return new OpenTelemetrySpan(span);
  }
  
  inject(span: Span, format: string, carrier: unknown): void {
    const context = (span as OpenTelemetrySpan).span.spanContext();
    this.tracer.inject(context, carrier);
  }
  
  extract(format: string, carrier: unknown): Span | null {
    const context = this.tracer.extract(carrier);
    if (!context) return null;
    
    // Create a span with the extracted context
    const span = this.tracer.startSpan("continuation", { 
      parent: context,
    });
    
    return new OpenTelemetrySpan(span);
  }
}

// Register your custom tracer
const observabilityProvider = new DefaultObservabilityProvider();
observabilityProvider.setTracer("messaging", new OpenTelemetryTracer(openTelemetryTracer));
setObservabilityProvider(observabilityProvider);
```

## Trace Context Propagation

Magic Button Messaging automatically propagates trace context between services using message context:

```typescript
import { createTracedContext } from "@magicbutton.cloud/messaging";

// Create a context with tracing information
const context = createTracedContext({
  source: "web-client",
  target: "order-service",
}, "checkout-flow");

// Send a request with the traced context
const result = await client.request("createOrder", orderData, context);

// The trace continues through all downstream services
```

The `createTracedContext` function:
1. Creates a new span for the operation
2. Generates a trace ID if one doesn't exist
3. Generates a span ID for the current operation
4. Sets the parent span ID to the previous span ID (if any)
5. Includes the span in the context metadata

When a service receives a message with trace context:
1. It extracts the trace information from the context
2. Creates a child span for its operations
3. Includes the trace information in its own downstream requests

This creates an end-to-end trace that spans multiple services.

## Logging with Trace Context

You can include trace context in your logs to correlate them with traces:

```typescript
import { logEvent, logRequest, logResponse } from "@magicbutton.cloud/messaging";

// Log an event with trace context
logEvent({
  type: "orderCreated",
  payload: {
    orderId: "order-123",
    customerId: "customer-456",
    amount: 99.99,
  },
  context: tracedContext,
});

// Log a request with trace context
logRequest({
  type: "processPayment",
  payload: {
    orderId: "order-123",
    amount: 99.99,
    paymentMethod: "credit-card",
  },
  context: tracedContext,
});

// Log a response with trace context
logResponse("processPayment", {
  success: true,
  data: {
    paymentId: "payment-789",
    status: "completed",
  },
  context: tracedContext,
}, startTime);
```

These functions automatically extract trace information from the context and include it in the logs.

## Middleware for Observability

You can create middleware to add observability to your application:

### Logging Middleware

```typescript
import { createEventLoggingMiddleware, createRequestLoggingMiddleware } from "@magicbutton.cloud/messaging";

// Create logging middleware
const eventLoggingMiddleware = createEventLoggingMiddleware();
const requestLoggingMiddleware = createRequestLoggingMiddleware();

// Register the middleware
middlewareManager.useGlobalEventMiddleware(eventLoggingMiddleware);
middlewareManager.useGlobalRequestMiddleware(requestLoggingMiddleware);
```

### Tracing Middleware

```typescript
import { EventMiddleware, RequestMiddleware } from "@magicbutton.cloud/messaging";

// Create a tracing middleware for events
const eventTracingMiddleware: EventMiddleware = async (event, next) => {
  const tracer = getObservabilityProvider().getTracer("messaging");
  
  // Extract parent span from context if it exists
  let parentSpan = null;
  if (event.context?.traceId && event.context?.spanId) {
    const carrier = {
      "trace-id": event.context.traceId,
      "span-id": event.context.spanId,
    };
    parentSpan = tracer.extract("text_map", carrier);
  }
  
  // Create a new span
  const span = tracer.startSpan(`event:${event.type}`, {
    childOf: parentSpan,
  });
  
  // Set span tags
  span.setTag("event.type", event.type);
  span.setTag("event.source", event.context?.source || "unknown");
  
  try {
    // Call the next middleware
    await next(event);
    
    // Set success tag
    span.setTag("event.success", true);
  } catch (error) {
    // Record the error
    span.setError(error);
    span.setTag("event.success", false);
    throw error;
  } finally {
    // Finish the span
    span.finish();
  }
};

// Create a tracing middleware for requests
const requestTracingMiddleware: RequestMiddleware = async (request, next) => {
  const tracer = getObservabilityProvider().getTracer("messaging");
  
  // Extract parent span from context if it exists
  let parentSpan = null;
  if (request.context?.traceId && request.context?.spanId) {
    const carrier = {
      "trace-id": request.context.traceId,
      "span-id": request.context.spanId,
    };
    parentSpan = tracer.extract("text_map", carrier);
  }
  
  // Create a new span
  const span = tracer.startSpan(`request:${request.type}`, {
    childOf: parentSpan,
  });
  
  // Set span tags
  span.setTag("request.type", request.type);
  span.setTag("request.source", request.context?.source || "unknown");
  span.setTag("request.target", request.context?.target || "unknown");
  
  try {
    // Call the next middleware
    const response = await next(request);
    
    // Set success tag
    span.setTag("request.success", response.success);
    
    if (!response.success && response.error) {
      span.setTag("error", true);
      span.setTag("error.code", response.error.code);
      span.setTag("error.message", response.error.message);
    }
    
    return response;
  } catch (error) {
    // Record the error
    span.setError(error);
    span.setTag("request.success", false);
    throw error;
  } finally {
    // Finish the span
    span.finish();
  }
};

// Register the middleware
middlewareManager.useGlobalEventMiddleware(eventTracingMiddleware);
middlewareManager.useGlobalRequestMiddleware(requestTracingMiddleware);
```

## Integrating with External Systems

### Integrating with Pino (Logging)

```typescript
import { Logger, LogLevel } from "@magicbutton.cloud/messaging";
import pino from "pino";

// Create a Pino logger
const pinoLogger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

// Create a custom logger that integrates with Pino
export class PinoLogger implements Logger {
  private logger: any; // Pino logger instance
  private name: string;
  
  constructor(name: string, logger) {
    this.name = name;
    this.logger = logger.child({ service: name });
  }
  
  debug(message: string, context?: Record<string, any>): void {
    this.logger.debug(context || {}, message);
  }
  
  info(message: string, context?: Record<string, any>): void {
    this.logger.info(context || {}, message);
  }
  
  warn(message: string, context?: Record<string, any>): void {
    this.logger.warn(context || {}, message);
  }
  
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.logger.error({
      error: error ? { message: error.message, stack: error.stack } : undefined,
      ...context,
    }, message);
  }
}

// Register your custom logger
const observabilityProvider = new DefaultObservabilityProvider();
observabilityProvider.setLogger("order-service", new PinoLogger("order-service", pinoLogger));
setObservabilityProvider(observabilityProvider);
```

### Integrating with Prometheus (Metrics)

```typescript
import { Metrics } from "@magicbutton.cloud/messaging";
import client from "prom-client";

// Initialize Prometheus client
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Create a custom metrics implementation that integrates with Prometheus
export class PrometheusMetrics implements Metrics {
  private counters = new Map<string, any>();
  private gauges = new Map<string, any>();
  private histograms = new Map<string, any>();
  
  increment(name: string, value: number = 1, tags?: Record<string, string>): void {
    const counter = this.getCounter(name);
    counter.inc(tags || {}, value);
  }
  
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    const gauge = this.getGauge(name);
    gauge.set(tags || {}, value);
  }
  
  histogram(name: string, value: number, tags?: Record<string, string>): void {
    const histogram = this.getHistogram(name);
    histogram.observe(tags || {}, value);
  }
  
  timing(name: string, value: number, tags?: Record<string, string>): void {
    // Use histogram for timings in Prometheus
    this.histogram(`${name}_milliseconds`, value, tags);
  }
  
  private getCounter(name: string): any {
    if (!this.counters.has(name)) {
      const counter = new client.Counter({
        name,
        help: `Counter for ${name}`,
        labelNames: [],
        registers: [register],
      });
      this.counters.set(name, counter);
    }
    return this.counters.get(name);
  }
  
  private getGauge(name: string): any {
    if (!this.gauges.has(name)) {
      const gauge = new client.Gauge({
        name,
        help: `Gauge for ${name}`,
        labelNames: [],
        registers: [register],
      });
      this.gauges.set(name, gauge);
    }
    return this.gauges.get(name);
  }
  
  private getHistogram(name: string): any {
    if (!this.histograms.has(name)) {
      const histogram = new client.Histogram({
        name,
        help: `Histogram for ${name}`,
        labelNames: [],
        registers: [register],
      });
      this.histograms.set(name, histogram);
    }
    return this.histograms.get(name);
  }
}

// Register your custom metrics implementation
const observabilityProvider = new DefaultObservabilityProvider();
observabilityProvider.setMetrics(new PrometheusMetrics());
setObservabilityProvider(observabilityProvider);
```

### Integrating with OpenTelemetry (Tracing)

```typescript
import { Tracer, Span } from "@magicbutton.cloud/messaging";
import { trace, context, SpanStatusCode } from "@opentelemetry/api";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

// Initialize OpenTelemetry
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "my-service",
  }),
});

const exporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register();

const openTelemetryTracer = trace.getTracer("my-service");

// Create a custom span implementation that integrates with OpenTelemetry
export class OpenTelemetrySpan implements Span {
  private span: any; // OpenTelemetry span
  
  constructor(span) {
    this.span = span;
  }
  
  setTag(key: string, value: string | number | boolean): this {
    this.span.setAttribute(key, value);
    return this;
  }
  
  setError(error: Error): this {
    this.span.recordException(error);
    this.span.setStatus({ 
      code: SpanStatusCode.ERROR, 
      message: error.message 
    });
    return this;
  }
  
  finish(): void {
    this.span.end();
  }
}

// Create a custom tracer implementation that integrates with OpenTelemetry
export class OpenTelemetryTracer implements Tracer {
  private tracer: any; // OpenTelemetry tracer
  
  constructor(tracer) {
    this.tracer = tracer;
  }
  
  startSpan(name: string, options?: { childOf?: Span }): Span {
    let parentContext;
    
    if (options?.childOf) {
      // Get the OpenTelemetry context from the parent span
      parentContext = (options.childOf as any).span.spanContext();
    }
    
    const span = this.tracer.startSpan(name, undefined, parentContext 
      ? context.setSpanContext(context.active(), parentContext)
      : undefined
    );
    
    return new OpenTelemetrySpan(span);
  }
  
  inject(span: Span, format: string, carrier: any): void {
    // This is a simplified example
    const otelSpan = (span as OpenTelemetrySpan).span;
    const ctx = context.setSpanContext(context.active(), otelSpan.spanContext());
    
    carrier["traceparent"] = `00-${otelSpan.spanContext().traceId}-${otelSpan.spanContext().spanId}-01`;
  }
  
  extract(format: string, carrier: any): Span | null {
    // This is a simplified example
    if (!carrier["traceparent"]) {
      return null;
    }
    
    const traceparent = carrier["traceparent"];
    const [, traceId, spanId] = traceparent.split("-");
    
    if (!traceId || !spanId) {
      return null;
    }
    
    // Create a non-recording span with the extracted context
    const span = this.tracer.startSpan("extracted", {
      parent: { traceId, spanId, traceFlags: 1 }
    });
    
    return new OpenTelemetrySpan(span);
  }
}

// Register your custom tracer
const observabilityProvider = new DefaultObservabilityProvider();
observabilityProvider.setTracer("messaging", new OpenTelemetryTracer(openTelemetryTracer));
setObservabilityProvider(observabilityProvider);
```

## Best Practices

1. **Consistent Logging**: Use a consistent logging format and level across services
2. **Structured Logging**: Include structured data in logs for easier parsing
3. **Meaningful Metrics**: Define metrics that provide valuable insights
4. **End-to-End Tracing**: Propagate trace context across service boundaries
5. **Correlation IDs**: Include correlation IDs in all logs and metrics
6. **Error Tracking**: Track errors and exceptions with appropriate context
7. **Performance Monitoring**: Monitor request latency and throughput
8. **Alert on Critical Issues**: Set up alerts for critical errors and performance issues
9. **Regular Review**: Regularly review logs, metrics, and traces to identify issues
10. **Secure Sensitive Data**: Avoid logging sensitive information

## Next Steps

Now that you understand observability, explore these related topics:

- [Message Context](../core-concepts/message-context): Learn how context is used for tracing
- [Middleware](middleware): Implement observability with middleware
- [Error Handling](error-handling): Handle and track errors properly