---
sidebar_position: 3
---

# Contract Generation with Claude

This guide provides templates and examples for using Claude to generate contracts for the Magic Button Messaging library.

## Understanding Contracts

Contracts in Magic Button Messaging are defined using Zod schemas and consist of:

1. **Event schemas** - Define the shape of events that can be emitted
2. **Request/response schemas** - Define the shape of requests and their responses
3. **Error definitions** - Define standardized error codes and messages

## Claude Prompt Template

Use the following prompt template to ask Claude to generate a contract based on your domain:

```
I need to create a contract for @magicbutton.cloud/messaging. Please help me generate a contract for a {DOMAIN} system with the following requirements:

## Domain Context
{Provide context about your domain, entities, and operations}

## Events
{List the events that should be defined in the contract, with their purpose}

## Requests/Responses
{List the request/response pairs that should be defined, with their purpose}

## Error Scenarios
{List potential error scenarios that should be defined in the contract}

Please generate the complete TypeScript code for this contract using the @magicbutton.cloud/messaging library's createContract, createEventMap, and createRequestSchemaMap functions, along with Zod schemas.

Reference the USAGE.md file included with the package for examples of well-structured contracts.
```

## Example: User Management Contract

Here's an example of using the prompt template for a user management system:

```
I need to create a contract for @magicbutton.cloud/messaging. Please help me generate a contract for a user management system with the following requirements:

## Domain Context
This contract will handle user management operations including user creation, profile updates, authentication, and role management. Users have profiles with personal information and can be assigned different roles with varying permissions.

## Events
- userCreated: Emitted when a new user is created
- userUpdated: Emitted when a user's profile is updated
- userDeleted: Emitted when a user is deleted
- userRoleChanged: Emitted when a user's role is changed

## Requests/Responses
- createUser: Create a new user with basic profile information
- getUserProfile: Retrieve a user's profile data
- updateUserProfile: Update a user's profile information
- deleteUser: Delete a user from the system
- assignRole: Assign a role to a user
- authenticateUser: Authenticate a user with credentials

## Error Scenarios
- USER_NOT_FOUND: When attempting to operate on a non-existent user
- DUPLICATE_EMAIL: When attempting to create a user with an email that already exists
- INVALID_CREDENTIALS: When authentication fails
- INSUFFICIENT_PERMISSIONS: When a user lacks permissions for an operation
- VALIDATION_ERROR: When input data fails validation

Please generate the complete TypeScript code for this contract using the @magicbutton.cloud/messaging library's createContract, createEventMap, and createRequestSchemaMap functions, along with Zod schemas.

Reference the USAGE.md file included with the package for examples of well-structured contracts.
```

## Claude's Response

Claude will generate contract code similar to the following:

```typescript
import { z } from 'zod';
import { 
  createContract, 
  createEventMap, 
  createRequestSchemaMap,
  createErrorMap
} from '@magicbutton.cloud/messaging';

// Define event schemas
const eventSchemas = createEventMap({
  userCreated: z.object({
    userId: z.string(),
    email: z.string().email(),
    username: z.string(),
    createdAt: z.number()
  }),
  userUpdated: z.object({
    userId: z.string(),
    updatedFields: z.record(z.unknown()),
    updatedAt: z.number()
  }),
  userDeleted: z.object({
    userId: z.string(),
    deletedAt: z.number()
  }),
  userRoleChanged: z.object({
    userId: z.string(),
    oldRole: z.string(),
    newRole: z.string(),
    changedAt: z.number(),
    changedBy: z.string()
  })
});

// Define request/response schemas
const requestSchemas = createRequestSchemaMap({
  createUser: {
    requestSchema: z.object({
      email: z.string().email(),
      username: z.string().min(3),
      password: z.string().min(8),
      fullName: z.string().optional(),
      initialRole: z.string().optional()
    }),
    responseSchema: z.object({
      userId: z.string(),
      createdAt: z.number()
    })
  },
  getUserProfile: {
    requestSchema: z.object({
      userId: z.string()
    }),
    responseSchema: z.object({
      userId: z.string(),
      email: z.string().email(),
      username: z.string(),
      fullName: z.string().optional(),
      role: z.string(),
      createdAt: z.number(),
      lastLoginAt: z.number().optional()
    })
  },
  updateUserProfile: {
    requestSchema: z.object({
      userId: z.string(),
      updates: z.object({
        email: z.string().email().optional(),
        username: z.string().min(3).optional(),
        fullName: z.string().optional(),
        password: z.string().min(8).optional()
      })
    }),
    responseSchema: z.object({
      userId: z.string(),
      updatedFields: z.array(z.string()),
      updatedAt: z.number()
    })
  },
  deleteUser: {
    requestSchema: z.object({
      userId: z.string()
    }),
    responseSchema: z.object({
      success: z.boolean(),
      deletedAt: z.number()
    })
  },
  assignRole: {
    requestSchema: z.object({
      userId: z.string(),
      role: z.string()
    }),
    responseSchema: z.object({
      userId: z.string(),
      oldRole: z.string(),
      newRole: z.string(),
      updatedAt: z.number()
    })
  },
  authenticateUser: {
    requestSchema: z.object({
      email: z.string().email(),
      password: z.string()
    }),
    responseSchema: z.object({
      userId: z.string(),
      token: z.string(),
      expiresAt: z.number(),
      role: z.string()
    })
  }
});

// Define error map
const errorMap = createErrorMap({
  USER_NOT_FOUND: {
    message: 'User with ID {userId} not found',
    metadata: {
      statusCode: 404,
      retry: { retryable: false }
    }
  },
  DUPLICATE_EMAIL: {
    message: 'User with email {email} already exists',
    metadata: {
      statusCode: 409,
      retry: { retryable: false }
    }
  },
  INVALID_CREDENTIALS: {
    message: 'Invalid email or password',
    metadata: {
      statusCode: 401,
      retry: { retryable: false }
    }
  },
  INSUFFICIENT_PERMISSIONS: {
    message: 'User does not have permission to perform this action',
    metadata: {
      statusCode: 403,
      retry: { retryable: false }
    }
  },
  VALIDATION_ERROR: {
    message: 'Validation error: {details}',
    metadata: {
      statusCode: 400,
      retry: { retryable: false }
    }
  }
});

// Create and export the contract
export const userManagementContract = createContract({
  events: eventSchemas,
  requests: requestSchemas,
  errors: errorMap
});

export default userManagementContract;
```

## Additional Tips

When using Claude to generate contracts:

1. **Be specific** about your domain entities and their relationships
2. **Include business rules** that should be encoded in the schemas
3. **Specify validation requirements** for each field
4. **Describe error conditions** thoroughly
5. **Mention special formats** for data types when relevant

## Next Steps

After generating your contract:

1. Review the generated schemas for accuracy and completeness
2. Add any missing validations or business rules
3. Implement the server handlers for each request
4. Set up client code to use the contract
5. Add appropriate error handling