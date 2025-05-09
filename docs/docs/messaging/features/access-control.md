---
sidebar_position: 1
---

# Access Control

Magic Button Messaging includes a powerful role-based access control (RBAC) system that enables you to secure your application's communication with fine-grained permissions. This page explains how the access control system works and how to implement it in your application.

## Introduction to Access Control

Access control in Magic Button Messaging is designed around these core concepts:

1. **Systems** - Define resources, actions, and roles for a specific domain
2. **Resources** - Entities that need protection (e.g., "orders", "users", "reports")
3. **Actions** - Operations that can be performed on resources (e.g., "create", "read", "update", "delete")
4. **Roles** - Named collections of permissions (e.g., "admin", "user", "guest")
5. **Permissions** - Rights to perform actions on resources (e.g., "order:read", "user:create")
6. **Actors** - Entities that perform actions (e.g., users, services, applications)

This flexible system allows you to implement a wide range of access control policies, from simple role-based checks to complex, context-aware authorization rules.

## Creating a System

A system represents a security domain that defines resources, actions, and roles:

```typescript
import { createSystem, createRole } from "@magicbutton.cloud/messaging";

// Define a system for a document management application
const documentSystem = createSystem({
  name: "document-system",
  resources: ["document", "folder", "comment"],
  actions: ["create", "read", "update", "delete", "share"],
  roles: [
    createRole({
      name: "admin",
      permissions: ["document:*", "folder:*", "comment:*"],
    }),
    createRole({
      name: "editor",
      permissions: ["document:read", "document:update", "document:create", "comment:*"],
      extends: ["viewer"],  // Roles can extend other roles
    }),
    createRole({
      name: "viewer",
      permissions: ["document:read", "comment:read"],
    }),
  ],
});
```

Key points about systems:
- Resources are string identifiers for protected entities
- Actions are string identifiers for operations on resources
- Roles are collections of permissions with a unique name
- Permissions are strings in the format `"resource:action"` (e.g., `"document:read"`)
- Wildcards (`*`) can be used to grant all actions on a resource (e.g., `"document:*"`)
- Roles can extend other roles to inherit their permissions

## Creating an Access Control Instance

Once you've defined a system, you can create an access control instance:

```typescript
import { createAccessControl } from "@magicbutton.cloud/messaging";

// Create an access control instance from the document system
const accessControl = createAccessControl(documentSystem);
```

The access control instance provides methods for checking permissions and roles.

## Creating Actors

Actors represent entities that perform actions. They have an ID, a type, and optional roles and permissions:

```typescript
import { createActor } from "@magicbutton.cloud/messaging";

// Create an admin user actor
const adminUser = createActor({
  id: "user-1",
  type: "user",
  roles: ["admin"],
});

// Create an editor user actor
const editorUser = createActor({
  id: "user-2",
  type: "user",
  roles: ["editor"],
});

// Create a viewer user actor
const viewerUser = createActor({
  id: "user-3",
  type: "user",
  roles: ["viewer"],
});

// Create an actor with direct permissions (not recommended for most cases)
const serviceAccount = createActor({
  id: "service-1",
  type: "service",
  permissions: ["document:read", "document:create"],
});
```

Key points about actors:
- The `id` is a unique identifier for the actor
- The `type` categorizes the actor (e.g., "user", "service", "application")
- `roles` is an array of role names assigned to the actor
- `permissions` is an optional array of direct permissions (use sparingly)

## Checking Permissions

You can check if an actor has a specific permission:

```typescript
// Check if the admin user can delete documents
const canDelete = accessControl.hasPermission(adminUser, "document:delete");
console.log(canDelete); // true

// Check if the editor user can delete documents
const editorCanDelete = accessControl.hasPermission(editorUser, "document:delete");
console.log(editorCanDelete); // false

// Check if the editor user can create documents
const editorCanCreate = accessControl.hasPermission(editorUser, "document:create");
console.log(editorCanCreate); // true
```

## Checking Roles

You can also check if an actor has a specific role:

```typescript
// Check if the admin user has the admin role
const isAdmin = accessControl.hasRole(adminUser, "admin");
console.log(isAdmin); // true

// Check if the editor user has the viewer role (inherited through extension)
const editorIsViewer = accessControl.hasRole(editorUser, "viewer");
console.log(editorIsViewer); // true
```

## Getting All Permissions

You can retrieve all permissions for an actor:

```typescript
// Get all permissions for the editor user
const editorPermissions = accessControl.getPermissions(editorUser);
console.log(editorPermissions);
// ["document:read", "document:update", "document:create", "comment:create", "comment:read", "comment:update", "comment:delete"]
```

This includes permissions from all assigned roles, including inherited permissions.

## Integrating with Message Context

Access control integrates seamlessly with message context. You typically include actor information in the message context:

```typescript
import { createMessageContext } from "@magicbutton.cloud/messaging";

// Create a message context with actor information
const context = createMessageContext({
  auth: {
    token: "jwt-token",
    actor: {
      id: "user-2",
      type: "user",
      roles: ["editor"],
    },
  },
});

// Send a request with the context
const document = await client.request("getDocument", { documentId: "doc-123" }, context);
```

On the server side, you can extract the actor from the context and check permissions:

```typescript
// Document service
server.handleRequest("getDocument", async (payload, context, clientId) => {
  // Extract the actor from the context
  const actor = context.auth?.actor;
  
  if (!actor) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }
  
  // Check if the actor has permission to read documents
  if (!accessControl.hasPermission(actor, "document:read")) {
    throw new Error("PERMISSION_DENIED");
  }
  
  // Proceed with retrieving the document
  const document = await documentRepository.findById(payload.documentId);
  
  return document;
});
```

## Middleware for Access Control

You can create middleware to handle access control consistently:

```typescript
import { createRequestMiddleware } from "@magicbutton.cloud/messaging";

// Create permission-checking middleware
function createPermissionMiddleware(accessControl, permissionMap) {
  return createRequestMiddleware(async (request, next) => {
    // Get the required permission for this request type
    const requiredPermission = permissionMap[request.type];
    
    if (!requiredPermission) {
      // No permission requirement specified, allow the request
      return next(request);
    }
    
    // Get the actor from the context
    const actor = request.context?.auth?.actor;
    
    if (!actor) {
      return {
        success: false,
        error: {
          code: "AUTHENTICATION_REQUIRED",
          message: "Authentication is required for this request",
        },
        context: request.context,
      };
    }
    
    // Check if the actor has the required permission
    if (!accessControl.hasPermission(actor, requiredPermission)) {
      return {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: `Permission denied: ${requiredPermission} is required`,
        },
        context: request.context,
      };
    }
    
    // Actor has permission, proceed with the request
    return next(request);
  });
}

// Create a permission map for document service requests
const documentPermissions = {
  "getDocument": "document:read",
  "createDocument": "document:create",
  "updateDocument": "document:update",
  "deleteDocument": "document:delete",
  "shareDocument": "document:share",
};

// Create the middleware
const permissionMiddleware = createPermissionMiddleware(
  accessControl,
  documentPermissions
);

// Use the middleware for all requests
server.useGlobalRequestMiddleware(permissionMiddleware);
```

## Advanced Access Control Patterns

### Resource-specific Permissions

You can implement more granular permissions by including resource-specific identifiers:

```typescript
// Define a system with resource-specific permissions
const documentSystem = createSystem({
  name: "document-system",
  resources: ["document", "folder", "comment"],
  actions: ["create", "read", "update", "delete", "share"],
  roles: [
    createRole({
      name: "owner",
      permissions: ["document:*:own", "folder:*:own", "comment:*:own"],
    }),
  ],
});

// Create a custom permission-checking function
function checkDocumentPermission(actor, action, documentId) {
  // Check for direct ownership permission
  if (accessControl.hasPermission(actor, `document:${action}:own`)) {
    // Verify that the actor actually owns this document
    return isDocumentOwner(actor.id, documentId);
  }
  
  // Check for general permission
  return accessControl.hasPermission(actor, `document:${action}`);
}

// Use in a request handler
server.handleRequest("updateDocument", async (payload, context, clientId) => {
  const actor = context.auth?.actor;
  
  if (!actor) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }
  
  // Check specific permission for this document
  if (!checkDocumentPermission(actor, "update", payload.documentId)) {
    throw new Error("PERMISSION_DENIED");
  }
  
  // Proceed with the update
  // ...
});
```

### Context-Based Permissions

You can implement context-based permissions that consider additional factors:

```typescript
// Create a context-aware permission checker
function checkPermissionWithContext(actor, permission, context) {
  // First, check basic role-based permission
  if (!accessControl.hasPermission(actor, permission)) {
    return false;
  }
  
  // Apply additional contextual rules
  
  // Time-based restrictions
  const currentHour = new Date().getHours();
  if (permission.startsWith("admin:") && (currentHour < 9 || currentHour > 17)) {
    return false; // Admin operations only during business hours
  }
  
  // IP-based restrictions
  const clientIp = context.metadata?.clientIp;
  if (permission === "system:config" && !isInternalIp(clientIp)) {
    return false; // System configuration only from internal network
  }
  
  // Resource ownership
  const resourceId = context.metadata?.resourceId;
  if (permission.includes(":update") && resourceId) {
    return isResourceOwner(actor.id, resourceId);
  }
  
  // All checks passed
  return true;
}
```

### Dynamic Role Assignment

You can implement dynamic role assignment based on user attributes or context:

```typescript
// Middleware that assigns dynamic roles
const dynamicRoleMiddleware = createRequestMiddleware(async (request, next) => {
  const actor = request.context?.auth?.actor;
  
  if (actor) {
    // Get user profile
    const userProfile = await userProfileService.getProfile(actor.id);
    
    // Assign roles based on subscription level
    if (userProfile.subscriptionLevel === "premium") {
      if (!actor.roles.includes("premium")) {
        actor.roles.push("premium");
      }
    }
    
    // Assign roles based on department
    if (userProfile.department === "finance") {
      if (!actor.roles.includes("finance")) {
        actor.roles.push("finance");
      }
    }
    
    // Assign roles based on features
    for (const feature of userProfile.enabledFeatures) {
      const featureRole = `feature-${feature}`;
      if (!actor.roles.includes(featureRole)) {
        actor.roles.push(featureRole);
      }
    }
  }
  
  return next(request);
});

server.useGlobalRequestMiddleware(dynamicRoleMiddleware);
```

## Best Practices

1. **Use Role-Based Permissions**: Prefer assigning roles rather than direct permissions
2. **Role Hierarchy**: Design roles with a clear hierarchy using the `extends` feature
3. **Granular Permissions**: Define permissions at the appropriate level of granularity
4. **Resource-Action Format**: Use the standard `resource:action` format for permissions
5. **Least Privilege**: Assign the minimum permissions necessary
6. **Consistent Enforcement**: Use middleware to ensure consistent access control
7. **Audit Logging**: Log permission checks for security auditing
8. **Regular Review**: Periodically review and update your access control system

## Next Steps

Now that you understand access control, explore these related topics:

- [Middleware](middleware): Learn how to use middleware for consistent access control
- [Message Context](../core-concepts/message-context): Understand how to pass actor information in context
- [Error Handling](error-handling): Handle access control errors properly