import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  tutorialSidebar: [
    "intro",
    "client-focus",
    {
      type: "category",
      label: "Certification",
      collapsed: false,
      items: [
        "certification/overview",
        "certification/professional",
        "certification/enterprise-architect",
        "certification/security-specialist",
      ],
    },
    {
      type: "category",
      label: "Starter Prompts",
      collapsed: false,
      items: [
        "starter-prompts/client",
        "starter-prompts/server",
      ],
    },
    {
      type: "category",
      label: "Concepts",
      collapsed: false,
      items: [
        "concepts/browser-extension",
        "concepts/nats-architecture",
      ],
    },
    {
      type: "category",
      label: "Messaging",
      collapsed: false,
      items: [
        "messaging/overview",
        "messaging/installation",
        "messaging/quick-start",
        {
          type: "category",
          label: "Core Concepts",
          items: [
            "messaging/core-concepts/contracts",
            "messaging/core-concepts/transport",
            "messaging/core-concepts/client-server",
            "messaging/core-concepts/message-context",
          ],
        },
        {
          type: "category",
          label: "Features",
          items: [
            "messaging/features/access-control",
            "messaging/features/middleware",
            "messaging/features/error-handling",
            "messaging/features/observability",
            "messaging/features/enterprise",
          ],
        },
        {
          type: "category",
          label: "API Reference",
          items: [
            "messaging/api/client",
            "messaging/api/server",
            "messaging/api/transport-adapter",
            "messaging/api/access-control",
          ],
        },
        "messaging/examples",
      ],
    },
    {
      type: "category",
      label: "Auth",
      collapsed: false,
      items: [
        "auth/overview",
        "auth/installation",
        "auth/quick-start",
        "auth/authentication",
        "auth/access-control",
        "auth/components",
        "auth/hooks",
      ],
    },
    {
      type: "category",
      label: "State",
      collapsed: false,
      items: ["state/overview"],
    },
  ],
  // AI sidebar
  aiSidebar: [
    {
      type: "category",
      label: "Claude",
      collapsed: false,
      items: [
        "ai/claude/overview",
        "ai/claude/prompt-templates",
        "ai/claude/contract-generation",
        "ai/claude/integration-patterns",
        "ai/claude/best-practices",
      ],
    },
  ],
  
  // TypeScript Reference sidebar
  typescriptSidebar: [
    "messaging/typescript/README",
    {
      type: "category",
      label: "Classes",
      items: [
        "messaging/typescript/classes/MessagingClient",
        "messaging/typescript/classes/MessagingServer",
        "messaging/typescript/classes/InMemoryTransport",
        "messaging/typescript/classes/MockTransport",
        "messaging/typescript/classes/ErrorRegistry",
        {
          type: "category",
          label: "More Classes",
          collapsed: true,
          items: [
            "messaging/typescript/classes/AuthProviderRegistry",
            "messaging/typescript/classes/AuthorizationProviderRegistry",
            "messaging/typescript/classes/BaseTransport",
            "messaging/typescript/classes/ClientProvider",
            "messaging/typescript/classes/ConfigurationRegistry",
            "messaging/typescript/classes/ConsoleLogger",
            "messaging/typescript/classes/ConsoleLoggerFactory",
            "messaging/typescript/classes/DefaultAuthProvider",
            "messaging/typescript/classes/DefaultAuthProviderFactory",
            "messaging/typescript/classes/DefaultAuthorizationProvider",
            "messaging/typescript/classes/DefaultAuthorizationProviderFactory",
            "messaging/typescript/classes/DefaultConfigurationProvider",
            "messaging/typescript/classes/DefaultConfigurationProviderFactory",
            "messaging/typescript/classes/DefaultMiddlewareFactory",
            "messaging/typescript/classes/DefaultMiddlewareProvider",
            "messaging/typescript/classes/DefaultObservabilityProviderFactory",
            "messaging/typescript/classes/EnvironmentConfigurationSource",
            "messaging/typescript/classes/InMemoryTransportFactory",
            "messaging/typescript/classes/JsonFileConfigurationSource",
            "messaging/typescript/classes/MemoryConfigurationSource",
            "messaging/typescript/classes/MessagingError",
            "messaging/typescript/classes/MiddlewareManager",
            "messaging/typescript/classes/MiddlewareRegistry",
            "messaging/typescript/classes/NoopMetrics",
            "messaging/typescript/classes/NoopMetricsFactory",
            "messaging/typescript/classes/NoopSpan",
            "messaging/typescript/classes/NoopTracer",
            "messaging/typescript/classes/NoopTracerFactory",
            "messaging/typescript/classes/ObservabilityProviderRegistry",
            "messaging/typescript/classes/ServerProvider",
            "messaging/typescript/classes/TestMessaging",
            "messaging/typescript/classes/TransportProvider",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Functions",
      items: [
        "messaging/typescript/functions/createContract",
        "messaging/typescript/functions/createEventMap",
        "messaging/typescript/functions/createRequestSchemaMap",
        "messaging/typescript/functions/createAccessControl",
        "messaging/typescript/functions/createRole",
        "messaging/typescript/functions/createSystem",
        {
          type: "category",
          label: "More Functions",
          collapsed: true,
          items: [
            "messaging/typescript/functions/areVersionsCompatible",
            "messaging/typescript/functions/compareVersions",
            "messaging/typescript/functions/createAuthenticationMiddleware",
            "messaging/typescript/functions/createEventLoggingMiddleware",
            "messaging/typescript/functions/createEventValidationMiddleware",
            "messaging/typescript/functions/createRequestLoggingMiddleware",
            "messaging/typescript/functions/createRequestValidationMiddleware",
            "messaging/typescript/functions/createTracedContext",
            "messaging/typescript/functions/createVersionedSchema",
            "messaging/typescript/functions/getLatestSchema",
            "messaging/typescript/functions/getLibraryMetadata",
            "messaging/typescript/functions/getObservabilityProvider",
            "messaging/typescript/functions/getSchemaByVersion",
            "messaging/typescript/functions/getVersion",
            "messaging/typescript/functions/getVersionInfo",
            "messaging/typescript/functions/handleErrors",
            "messaging/typescript/functions/isDeprecated",
            "messaging/typescript/functions/isUpdateRecommended",
            "messaging/typescript/functions/meetsMinimumRequirements",
            "messaging/typescript/functions/parseVersion",
            "messaging/typescript/functions/retry",
            "messaging/typescript/functions/setObservabilityProvider",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Interfaces",
      items: [
        "messaging/typescript/interfaces/IContract",
        "messaging/typescript/interfaces/ITransport",
        "messaging/typescript/interfaces/IClientOptions",
        "messaging/typescript/interfaces/IServerOptions",
        "messaging/typescript/interfaces/IMessageContext",
        {
          type: "category",
          label: "More Interfaces",
          collapsed: true,
          items: [
            "messaging/typescript/interfaces/AccessControl",
            "messaging/typescript/interfaces/AuthProviderConfig",
            "messaging/typescript/interfaces/AuthProviderFactory",
            "messaging/typescript/interfaces/AuthorizationProviderConfig",
            "messaging/typescript/interfaces/AuthorizationProviderFactory",
            "messaging/typescript/interfaces/ClientConfig",
            "messaging/typescript/interfaces/ClientFactory",
            "messaging/typescript/interfaces/ConfigurationProvider",
            "messaging/typescript/interfaces/ConfigurationProviderFactory",
            "messaging/typescript/interfaces/ConfigurationSource",
            "messaging/typescript/interfaces/DefaultAuthProviderConfig",
            "messaging/typescript/interfaces/IAccessSettings",
            "messaging/typescript/interfaces/IActor",
            "messaging/typescript/interfaces/IAuthProvider",
            "messaging/typescript/interfaces/IAuthResult",
            "messaging/typescript/interfaces/IAuthorizationProvider",
            "messaging/typescript/interfaces/IErrorDefinition",
            "messaging/typescript/interfaces/IEventPayload",
            "messaging/typescript/interfaces/IPermissionDefinition",
            "messaging/typescript/interfaces/IRequestPayload",
            "messaging/typescript/interfaces/IResponsePayload",
            "messaging/typescript/interfaces/IRoleDefinition",
            "messaging/typescript/interfaces/Logger",
            "messaging/typescript/interfaces/LoggerFactory",
            "messaging/typescript/interfaces/MessagingConfig",
            "messaging/typescript/interfaces/Metrics",
            "messaging/typescript/interfaces/MetricsFactory",
            "messaging/typescript/interfaces/MiddlewareConfig",
            "messaging/typescript/interfaces/MiddlewareFactory",
            "messaging/typescript/interfaces/MiddlewareProvider",
            "messaging/typescript/interfaces/MockTransportOptions",
            "messaging/typescript/interfaces/ObservabilityConfig",
            "messaging/typescript/interfaces/ObservabilityProvider",
            "messaging/typescript/interfaces/ObservabilityProviderFactory",
            "messaging/typescript/interfaces/Role",
            "messaging/typescript/interfaces/SchemaVersion",
            "messaging/typescript/interfaces/ServerConfig",
            "messaging/typescript/interfaces/ServerFactory",
            "messaging/typescript/interfaces/Span",
            "messaging/typescript/interfaces/System",
            "messaging/typescript/interfaces/TestMessagingOptions",
            "messaging/typescript/interfaces/Tracer",
            "messaging/typescript/interfaces/TracerFactory",
            "messaging/typescript/interfaces/TransportConfig",
            "messaging/typescript/interfaces/TransportFactory",
            "messaging/typescript/interfaces/VersionedSchema",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Types & Enums",
      items: [
        "messaging/typescript/type-aliases/Contract",
        "messaging/typescript/type-aliases/Transport",
        "messaging/typescript/enumerations/ClientStatus",
        "messaging/typescript/enumerations/ErrorSeverity",
        "messaging/typescript/enumerations/ErrorType",
        "messaging/typescript/enumerations/LogLevel",
        {
          type: "category",
          label: "More Types",
          collapsed: true,
          items: [
            "messaging/typescript/type-aliases/AccessSettings",
            "messaging/typescript/type-aliases/Actor",
            "messaging/typescript/type-aliases/AuthProvider",
            "messaging/typescript/type-aliases/AuthResult",
            "messaging/typescript/type-aliases/AuthorizationProvider",
            "messaging/typescript/type-aliases/EventCaptureCallback",
            "messaging/typescript/type-aliases/EventMiddleware",
            "messaging/typescript/type-aliases/EventPayload",
            "messaging/typescript/type-aliases/EventSchemas",
            "messaging/typescript/type-aliases/InferEventData",
            "messaging/typescript/type-aliases/InferRequestData",
            "messaging/typescript/type-aliases/InferResponseData",
            "messaging/typescript/type-aliases/MessageContext",
            "messaging/typescript/type-aliases/PermissionDefinition",
            "messaging/typescript/type-aliases/RequestCaptureCallback",
            "messaging/typescript/type-aliases/RequestMiddleware",
            "messaging/typescript/type-aliases/RequestPayload",
            "messaging/typescript/type-aliases/RequestSchemaType",
            "messaging/typescript/type-aliases/RequestSchemas",
            "messaging/typescript/type-aliases/ResponsePayload",
            "messaging/typescript/type-aliases/ResponseSchemaType",
            "messaging/typescript/type-aliases/RoleDefinition",
            "messaging/typescript/type-aliases/SchemaType",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Variables",
      items: [
        "messaging/typescript/variables/LIBRARY_NAME",
        "messaging/typescript/variables/VERSION",
        "messaging/typescript/variables/FEATURES",
        "messaging/typescript/variables/COMPATIBILITY",
        "messaging/typescript/variables/DEFAULT_CONFIG",
        "messaging/typescript/variables/LIBRARY_DESCRIPTION",
      ],
    },
    "messaging/typescript/globals",
  ],
};

export default sidebars;