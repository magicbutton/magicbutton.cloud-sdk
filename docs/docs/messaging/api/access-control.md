---
sidebar_position: 4
---

# Access Control API Reference

This page provides detailed API reference for the access control system in Magic Button Messaging.

## Core Concepts

Magic Button Messaging's access control system is built around the following concepts:

- **Systems**: Define resources, actions, and roles for a specific domain
- **Resources**: Entities that need protection (e.g., "orders", "users", "reports")
- **Actions**: Operations that can be performed on resources (e.g., "create", "read", "update", "delete")
- **Roles**: Named collections of permissions with a specific purpose
- **Permissions**: Rights to perform actions on resources, in the format `"resource:action"`
- **Actors**: Entities that perform actions, with assigned roles or permissions

## System Interface

The `System` interface defines a security domain:

```typescript
export interface System {
  name: string
  resources: string[]
  actions: string[]
  roles: Role[]
}
```

- `name` - The system name (e.g., "document-system", "order-system")
- `resources` - Array of resource names (e.g., "document", "order", "user")
- `actions` - Array of action names (e.g., "create", "read", "update", "delete")
- `roles` - Array of role definitions

## Role Interface

The `Role` interface defines a named collection of permissions:

```typescript
export interface Role {
  name: string
  permissions: string[]
  extends?: string[]
}
```

- `name` - The role name (e.g., "admin", "editor", "viewer")
- `permissions` - Array of permissions in the format `"resource:action"` (e.g., "document:read")
- `extends` - (Optional) Array of other role names that this role extends

## Actor Interface

The `Actor` interface represents an entity that performs actions:

```typescript
export interface Actor {
  id: string
  type: string
  roles?: string[]
  permissions?: string[]
}
```

- `id` - Unique identifier for the actor
- `type` - Actor type (e.g., "user", "service", "application")
- `roles` - (Optional) Array of role names assigned to the actor
- `permissions` - (Optional) Array of direct permissions assigned to the actor

## AccessControl Interface

The `AccessControl` interface defines methods for checking permissions and roles:

```typescript
export interface AccessControl {
  hasPermission(actor: Actor, permission: string): boolean
  hasRole(actor: Actor, role: string): boolean
  getPermissions(actor: Actor): string[]
  getRoles(actor: Actor): string[]
}
```

- `hasPermission` - Checks if an actor has a specific permission
- `hasRole` - Checks if an actor has a specific role
- `getPermissions` - Gets all permissions for an actor (including those derived from roles)
- `getRoles` - Gets all roles for an actor

## Core Functions

### createSystem

```typescript
createSystem(system: System): System
```

Creates a system definition.

#### Parameters

- `system` - The system definition

#### Returns

- The created system

#### Example

```typescript
import { createSystem, createRole } from "@magicbutton.cloud/messaging";

// Create a document system
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
      extends: ["viewer"],
    }),
    createRole({
      name: "viewer",
      permissions: ["document:read", "comment:read"],
    }),
  ],
});
```

### createRole

```typescript
createRole(role: Role): Role
```

Creates a role definition.

#### Parameters

- `role` - The role definition

#### Returns

- The created role

#### Example

```typescript
import { createRole } from "@magicbutton.cloud/messaging";

// Create an admin role
const adminRole = createRole({
  name: "admin",
  permissions: ["document:*", "folder:*", "comment:*"],
});

// Create an editor role that extends viewer
const editorRole = createRole({
  name: "editor",
  permissions: ["document:update", "document:create", "comment:create"],
  extends: ["viewer"],
});

// Create a viewer role
const viewerRole = createRole({
  name: "viewer",
  permissions: ["document:read", "comment:read"],
});
```

### createActor

```typescript
createActor(actor: Actor): Actor
```

Creates an actor.

#### Parameters

- `actor` - The actor definition

#### Returns

- The created actor

#### Example

```typescript
import { createActor } from "@magicbutton.cloud/messaging";

// Create an admin user
const adminUser = createActor({
  id: "user-1",
  type: "user",
  roles: ["admin"],
});

// Create an editor user
const editorUser = createActor({
  id: "user-2",
  type: "user",
  roles: ["editor"],
});

// Create a viewer user
const viewerUser = createActor({
  id: "user-3",
  type: "user",
  roles: ["viewer"],
});

// Create a service account with direct permissions
const serviceAccount = createActor({
  id: "service-1",
  type: "service",
  permissions: ["document:read", "document:create"],
});
```

### createAccessControl

```typescript
createAccessControl(system: System): AccessControl
```

Creates an access control instance for a system.

#### Parameters

- `system` - The system to create access control for

#### Returns

- The access control instance

#### Example

```typescript
import { createAccessControl } from "@magicbutton.cloud/messaging";

// Create access control for the document system
const accessControl = createAccessControl(documentSystem);
```

## Permission Checking

### hasPermission

```typescript
hasPermission(actor: Actor, permission: string): boolean
```

Checks if an actor has a specific permission.

#### Parameters

- `actor` - The actor to check
- `permission` - The permission to check for (format: `"resource:action"`)

#### Returns

- `true` if the actor has the permission, `false` otherwise

#### Example

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

### hasRole

```typescript
hasRole(actor: Actor, role: string): boolean
```

Checks if an actor has a specific role.

#### Parameters

- `actor` - The actor to check
- `role` - The role name to check for

#### Returns

- `true` if the actor has the role, `false` otherwise

#### Example

```typescript
// Check if the admin user has the admin role
const isAdmin = accessControl.hasRole(adminUser, "admin");
console.log(isAdmin); // true

// Check if the editor user has the viewer role (inherited through extension)
const editorIsViewer = accessControl.hasRole(editorUser, "viewer");
console.log(editorIsViewer); // true
```

### getPermissions

```typescript
getPermissions(actor: Actor): string[]
```

Gets all permissions for an actor, including those derived from roles.

#### Parameters

- `actor` - The actor to get permissions for

#### Returns

- Array of all permissions the actor has

#### Example

```typescript
// Get all permissions for the editor user
const editorPermissions = accessControl.getPermissions(editorUser);
console.log(editorPermissions);
// ["document:read", "document:update", "document:create", "comment:read", "comment:create", "comment:update", "comment:delete"]
```

### getRoles

```typescript
getRoles(actor: Actor): string[]
```

Gets all roles for an actor.

#### Parameters

- `actor` - The actor to get roles for

#### Returns

- Array of all roles the actor has

#### Example

```typescript
// Get all roles for the editor user
const editorRoles = accessControl.getRoles(editorUser);
console.log(editorRoles); // ["editor"]
```

## Permission Format

Permissions in Magic Button Messaging follow a standard format: `"resource:action"`.

- Resources are defined in the system's `resources` array
- Actions are defined in the system's `actions` array
- The wildcard `*` can be used to grant all actions on a resource: `"document:*"`
- Some implementations support specific resource instances: `"document:read:123"`

## Role Inheritance

Roles can extend other roles through the `extends` property, inheriting all permissions from the extended roles.

```typescript
// Viewer role
const viewerRole = createRole({
  name: "viewer",
  permissions: ["document:read"],
});

// Editor role extends viewer
const editorRole = createRole({
  name: "editor",
  permissions: ["document:update", "document:create"],
  extends: ["viewer"],
});

// Admin role extends editor
const adminRole = createRole({
  name: "admin",
  permissions: ["document:delete", "folder:*"],
  extends: ["editor"],
});
```

In this example:
- A viewer can read documents
- An editor can read, update, and create documents (read is inherited from viewer)
- An admin can read, update, create, and delete documents, and has full access to folders (read, update, and create are inherited from viewer and editor)

## Permission Checking Algorithm

The algorithm for checking permissions follows these steps:

1. Check if the actor has the specific permission directly assigned
2. If not, check if any of the actor's roles grant the permission
3. For each role, check both directly assigned permissions and inherited permissions

Role inheritance is resolved recursively, so permissions flow down through the role hierarchy.

## Integration with Message Context

Access control is typically used with message context to check permissions for requests:

```typescript
import { createMessageContext } from "@magicbutton.cloud/messaging";

// Create a message context with actor information
const context = createMessageContext({
  auth: {
    token: "jwt-token",
    actor: {
      id: "user-123",
      type: "user",
      roles: ["editor"],
    },
  },
});

// In a request handler
server.handleRequest("updateDocument", async (payload, context, clientId) => {
  // Extract the actor from the context
  const actor = context.auth?.actor;
  
  if (!actor) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }
  
  // Check if the actor has permission to update documents
  if (!accessControl.hasPermission(actor, "document:update")) {
    throw new Error("PERMISSION_DENIED");
  }
  
  // Proceed with the update
  const document = await documentRepository.findById(payload.documentId);
  
  if (!document) {
    throw new Error("DOCUMENT_NOT_FOUND");
  }
  
  // Update document
  document.content = payload.content;
  await documentRepository.save(document);
  
  return document;
});
```

## Resource-Instance Level Permissions

For more fine-grained control, you can implement resource-instance level permissions:

```typescript
// Define a system with resource-instance level permissions
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

## Complete Example

Here's a complete example showing how to use the access control API:

```typescript
import { 
  createSystem, 
  createRole, 
  createActor, 
  createAccessControl,
  createMessageContext,
  Server,
  InMemoryTransport
} from "@magicbutton.cloud/messaging";

// Create a document management system
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
      extends: ["viewer"],
    }),
    createRole({
      name: "viewer",
      permissions: ["document:read", "comment:read"],
    }),
  ],
});

// Create access control
const accessControl = createAccessControl(documentSystem);

// Create actors
const adminUser = createActor({
  id: "user-1",
  type: "user",
  roles: ["admin"],
});

const editorUser = createActor({
  id: "user-2",
  type: "user",
  roles: ["editor"],
});

const viewerUser = createActor({
  id: "user-3",
  type: "user",
  roles: ["viewer"],
});

// Mock document repository
const documents = new Map();
documents.set("doc-1", { id: "doc-1", title: "Document 1", content: "Content 1" });
documents.set("doc-2", { id: "doc-2", title: "Document 2", content: "Content 2" });

// Create a server
const server = new Server(new InMemoryTransport());

// Start the server
await server.start("memory://document-service");

// Handle get document request
server.handleRequest("getDocument", async (payload, context, clientId) => {
  const { documentId } = payload;
  
  // Verify actor
  const actor = context.auth?.actor;
  if (!actor) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }
  
  // Check read permission
  if (!accessControl.hasPermission(actor, "document:read")) {
    throw new Error("PERMISSION_DENIED");
  }
  
  // Get document
  const document = documents.get(documentId);
  if (!document) {
    throw new Error("DOCUMENT_NOT_FOUND");
  }
  
  return document;
});

// Handle update document request
server.handleRequest("updateDocument", async (payload, context, clientId) => {
  const { documentId, content } = payload;
  
  // Verify actor
  const actor = context.auth?.actor;
  if (!actor) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }
  
  // Check update permission
  if (!accessControl.hasPermission(actor, "document:update")) {
    throw new Error("PERMISSION_DENIED");
  }
  
  // Get document
  const document = documents.get(documentId);
  if (!document) {
    throw new Error("DOCUMENT_NOT_FOUND");
  }
  
  // Update document
  document.content = content;
  
  return document;
});

// Handle delete document request
server.handleRequest("deleteDocument", async (payload, context, clientId) => {
  const { documentId } = payload;
  
  // Verify actor
  const actor = context.auth?.actor;
  if (!actor) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }
  
  // Check delete permission
  if (!accessControl.hasPermission(actor, "document:delete")) {
    throw new Error("PERMISSION_DENIED");
  }
  
  // Get document
  const document = documents.get(documentId);
  if (!document) {
    throw new Error("DOCUMENT_NOT_FOUND");
  }
  
  // Delete document
  documents.delete(documentId);
  
  return { success: true, documentId };
});

// Example client code
async function clientExample() {
  // Create client and connect
  const client = new Client(new InMemoryTransport());
  await client.connect("memory://document-service");
  
  // Admin user context
  const adminContext = createMessageContext({
    auth: { actor: adminUser },
  });
  
  // Editor user context
  const editorContext = createMessageContext({
    auth: { actor: editorUser },
  });
  
  // Viewer user context
  const viewerContext = createMessageContext({
    auth: { actor: viewerUser },
  });
  
  // Admin can get, update, and delete documents
  try {
    const doc = await client.request("getDocument", { documentId: "doc-1" }, adminContext);
    console.log("Admin got document:", doc);
    
    const updatedDoc = await client.request("updateDocument", {
      documentId: "doc-1",
      content: "Updated content",
    }, adminContext);
    console.log("Admin updated document:", updatedDoc);
    
    const deleteResult = await client.request("deleteDocument", {
      documentId: "doc-1",
    }, adminContext);
    console.log("Admin deleted document:", deleteResult);
  } catch (error) {
    console.error("Admin error:", error);
  }
  
  // Editor can get and update, but not delete documents
  try {
    const doc = await client.request("getDocument", { documentId: "doc-2" }, editorContext);
    console.log("Editor got document:", doc);
    
    const updatedDoc = await client.request("updateDocument", {
      documentId: "doc-2",
      content: "Editor updated content",
    }, editorContext);
    console.log("Editor updated document:", updatedDoc);
    
    // This should fail with permission denied
    await client.request("deleteDocument", { documentId: "doc-2" }, editorContext);
  } catch (error) {
    console.error("Editor error:", error);
  }
  
  // Viewer can get, but not update or delete documents
  try {
    const doc = await client.request("getDocument", { documentId: "doc-2" }, viewerContext);
    console.log("Viewer got document:", doc);
    
    // This should fail with permission denied
    await client.request("updateDocument", {
      documentId: "doc-2",
      content: "Viewer updated content",
    }, viewerContext);
  } catch (error) {
    console.error("Viewer error:", error);
  }
  
  // Disconnect the client
  await client.disconnect();
}

// Run the example
clientExample().catch(console.error);

// Eventually stop the server
// await server.stop();
```

## Best Practices

1. **Role-Based Design**: Design role-based permissions rather than assigning permissions directly to actors
2. **Least Privilege**: Assign the minimum required permissions to each role
3. **Role Hierarchy**: Use role inheritance to create a clear hierarchy
4. **Permission Naming Convention**: Use consistent naming for resources and actions
5. **Context-Based Permission Checks**: Check permissions in the context of specific operations
6. **Centralized Permission Logic**: Define permission checking in one place
7. **Testing**: Test permission checking with different actors and operations